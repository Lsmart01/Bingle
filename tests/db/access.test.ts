// Access rules and privacy, tested against the real migrations.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { addCourt, addPlayer, createTestDb, uid, type TestDb } from "./harness";

let db: TestDb;
const ANA = uid(1);
const BO = uid(2);
const CY = uid(3);

beforeAll(async () => {
  db = await createTestDb();
  await addCourt(db, "topaz");
  await addPlayer(db, { id: ANA, name: "Ana", birthDate: "1990-01-01", homeCourtSlug: "topaz", prefGender: ["woman"] });
  await addPlayer(db, { id: BO, name: "Bo", homeCourtSlug: "topaz" });
  await addPlayer(db, { id: CY, name: "Cy" });
});
afterAll(() => db.close());

const denied = /permission denied|row-level security|violates/;

describe("birth date and preferences stay private", () => {
  test("other players see age, never birth date or preferences", async () => {
    const [ana] = await db.as(BO).sql<Record<string, unknown>>(`select * from public.player_cards where id = $1`, [ANA]);
    expect(ana.age).toBeGreaterThanOrEqual(35);
    expect(ana).not.toHaveProperty("birth_date");
    expect(ana).not.toHaveProperty("pref_gender");
    expect(ana).not.toHaveProperty("last_active_at");
  });

  test("the players table only shows your own row", async () => {
    const rows = await db.as(BO).sql<{ id: string }>(`select id, birth_date from public.players`);
    expect(rows.map((r) => r.id)).toEqual([BO]);
  });

  test("signed-out visitors can browse cards but not the players table", async () => {
    const cards = await db.as(null).sql(`select id from public.player_cards`);
    expect(cards).toHaveLength(3);
    await expect(db.as(null).sql(`select * from public.players`)).rejects.toThrow(denied);
  });

  test("nobody can write through the card views", async () => {
    await expect(db.as(null).sql(`update public.player_cards set name = 'x'`)).rejects.toThrow(denied);
    await expect(db.as(BO).sql(`update public.player_cards set name = 'x' where id = $1`, [ANA])).rejects.toThrow(denied);
    await expect(db.as(BO).sql(`delete from public.directory_players`)).rejects.toThrow(denied);
  });
});

describe("profiles", () => {
  test("you can edit your own profile, not anyone else's", async () => {
    await db.as(BO).sql(`update public.players set bio = 'hi' where id = $1`, [BO]);
    await db.as(BO).sql(`update public.players set bio = 'hacked' where id = $1`, [ANA]); // silently matches no rows
    const [ana] = await db.pg.query<{ bio: string }>(`select bio from public.players where id = $1`, [ANA]).then((r) => r.rows);
    expect(ana.bio).toBe("");
  });

  test("birth date can't be changed after sign-up", async () => {
    await expect(
      db.as(BO).sql(`update public.players set birth_date = '1950-01-01' where id = $1`, [BO]),
    ).rejects.toThrow(denied);
  });

  test("Bink is 18+", async () => {
    const kid = uid(90);
    await db.pg.query(`insert into auth.users (id) values ($1)`, [kid]);
    const seventeen = new Date(Date.now() - 17 * 365.25 * 86_400_000).toISOString().slice(0, 10);
    await expect(
      db.as(kid).sql(
        `insert into public.players (id, name, photo_url, birth_date, skill, play_style, formats)
         values ($1, 'Kid', 'x.jpg', $2, 3.0, 'fun', '{doubles}')`,
        [kid, seventeen],
      ),
    ).rejects.toThrow(/18 and over/);
  });

  test("you can't create a profile for someone else", async () => {
    const other = uid(91);
    await db.pg.query(`insert into auth.users (id) values ($1)`, [other]);
    await expect(
      db.as(BO).sql(
        `insert into public.players (id, name, photo_url, birth_date, skill, play_style, formats)
         values ($1, 'Fake', 'x.jpg', '1990-01-01', 3.0, 'fun', '{doubles}')`,
        [other],
      ),
    ).rejects.toThrow(denied);
  });

  test("a home court is unique per player", async () => {
    await addCourt(db, "beacon");
    await expect(
      db.as(BO).sql(
        `insert into public.player_courts (player_id, court_id, is_home)
         select $1, id, true from public.courts where slug = 'beacon'`,
        [BO],
      ),
    ).rejects.toThrow(/duplicate key/);
  });
});

describe("blocking", () => {
  beforeAll(async () => {
    const { error } = await db.as(ANA).rpc("block_player", { p_player_id: CY });
    expect(error).toBeNull();
  });

  test("blocked players vanish from each other's directory, both ways", async () => {
    const forAna = await db.as(ANA).sql<{ id: string }>(`select id from public.directory_players`);
    const forCy = await db.as(CY).sql<{ id: string }>(`select id from public.directory_players`);
    expect(forAna.map((r) => r.id)).toEqual([BO]);
    expect(forCy.map((r) => r.id)).toEqual([BO]);
  });

  test("you can see your own blocks, never who blocked you", async () => {
    expect(await db.as(ANA).sql(`select * from public.blocks`)).toHaveLength(1);
    expect(await db.as(CY).sql(`select * from public.blocks`)).toHaveLength(0);
  });

  test("blocks can only be changed through block_player / unblock_player", async () => {
    await expect(
      db.as(CY).sql(`insert into public.blocks (blocker_id, blocked_id) values ($1, $2)`, [ANA, BO]),
    ).rejects.toThrow(denied);
  });
});

describe("writes go through the functions", () => {
  test("signed-out visitors can't call write functions", async () => {
    const { error } = await db.as(null).rpc("request_to_play", { p_player_id: ANA });
    expect(error?.message).toMatch(/permission denied/);
  });

  test("tables with function-only writes refuse direct inserts", async () => {
    for (const q of [
      `insert into public.join_requests (requester_id, player_id) values ('${BO}', '${ANA}')`,
      `insert into public.game_players (game_id, player_id) values (gen_random_uuid(), '${BO}')`,
      `insert into public.conversation_members (conversation_id, player_id) values (gen_random_uuid(), '${BO}')`,
      `insert into public.courts (slug, name, municipality, area, latitude, longitude) values ('x', 'x', 'x', 'x', 0, 0)`,
    ]) {
      await expect(db.as(BO).sql(q), q).rejects.toThrow(denied);
    }
  });

  test("security-definer helpers aren't callable through the API schema", async () => {
    const rows = await db.pg.query<{ name: string }>(
      `select p.proname as name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.prosecdef
         and has_function_privilege('anon', p.oid, 'execute')`,
    );
    expect(rows.rows.map((r) => r.name)).toEqual([]);
  });
});

describe("king of the hill", () => {
  test("a result counts only once both players confirm", async () => {
    const [{ id }] = await db.as(ANA).sql<{ id: string }>(
      `insert into public.hill_matches (court_id, winner_id, loser_id, score, winner_confirmed, recorded_by)
       select id, $1, $2, '11-4', true, $1 from public.courts where slug = 'topaz' returning id`,
      [ANA, BO],
    );
    expect(await db.as(null).sql(`select * from public.hill_streaks`)).toHaveLength(0);
    expect((await db.as(BO).rpc("confirm_hill_match", { p_match_id: id })).error).toBeNull();
    const streaks = await db.as(null).sql<{ player_id: string; streak: number }>(`select * from public.hill_streaks`);
    expect(streaks).toEqual([expect.objectContaining({ player_id: ANA, streak: 1 })]);
  });

  test("you can't confirm a result for your opponent", async () => {
    await expect(
      db.as(ANA).sql(
        `insert into public.hill_matches (court_id, winner_id, loser_id, score, loser_confirmed, recorded_by)
         select id, $1, $2, '11-4', true, $1 from public.courts where slug = 'topaz'`,
        [ANA, BO],
      ),
    ).rejects.toThrow(denied);
  });
});
