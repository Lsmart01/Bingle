// King of the hill: recording singles and doubles results, confirming,
// disputing, and the 24-hour rule for opponents who never answer.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  confirmHillMatch, disputeHillMatch, getCourtHill, getMyHillResults, recordHillMatch,
} from "@/features/king-of-the-hill/data";
import { addCourt, addPlayer, createTestDb, uid, type TestDb } from "./harness";

let db: TestDb;
let topaz: string;
let beacon: string;
let oakBay: string;
const [ANA, BO, CY, DEE, ED] = [1, 2, 3, 4, 5].map(uid);

beforeAll(async () => {
  db = await createTestDb();
  await addCourt(db, "topaz");
  await addCourt(db, "beacon");
  await addCourt(db, "oak-bay");
  const ids = await db.pg.query<{ id: string; slug: string }>(`select id, slug from public.courts`);
  const bySlug = Object.fromEntries(ids.rows.map((r) => [r.slug, r.id]));
  [topaz, beacon, oakBay] = [bySlug.topaz, bySlug.beacon, bySlug["oak-bay"]];
  for (const [id, name] of [[ANA, "Ana"], [BO, "Bo"], [CY, "Cy"], [DEE, "Dee"], [ED, "Ed"]]) {
    await addPlayer(db, { id, name });
  }
});
afterAll(() => db.close());

/** Pretend a result was recorded this many hours ago. */
const age = (matchId: string, hours: number) =>
  db.pg.query(`update public.hill_matches set created_at = now() - make_interval(hours => $2) where id = $1`, [
    matchId, hours,
  ]);

describe("singles", () => {
  test("a result counts once the other side confirms it", async () => {
    const id = await recordHillMatch(db.as(ANA), {
      courtId: topaz, format: "singles", winnerIds: [ANA], loserIds: [BO], score: "11-4",
    });
    expect(await getCourtHill(db.as(null), topaz)).toBeNull();

    const [mine] = await getMyHillResults(db.as(BO));
    expect(mine).toMatchObject({ id, status: "pending", counts: false, can_answer: true });
    expect((await getMyHillResults(db.as(ANA)))[0].can_answer).toBe(false);

    await confirmHillMatch(db.as(BO), id);
    const hill = await getCourtHill(db.as(null), topaz);
    expect(hill).toMatchObject({ streak: 1, players: [{ name: "Ana" }] });
  });

  test("the side that recorded a result can't confirm it", async () => {
    const id = await recordHillMatch(db.as(ANA), {
      courtId: topaz, format: "singles", winnerIds: [ANA], loserIds: [CY], score: "11-2",
    });
    await expect(confirmHillMatch(db.as(ANA), id)).rejects.toThrow(/other side confirms/);
    await expect(confirmHillMatch(db.as(DEE), id)).rejects.toThrow(/played in/);
    await confirmHillMatch(db.as(CY), id);
    expect(await getCourtHill(db.as(null), topaz)).toMatchObject({ streak: 2, players: [{ name: "Ana" }] });
  });

  test("an opponent who doesn't answer within 24 hours takes the loss", async () => {
    const id = await recordHillMatch(db.as(DEE), {
      courtId: beacon, format: "singles", winnerIds: [DEE], loserIds: [ED], score: "11-9",
    });
    await age(id, 23);
    expect(await getCourtHill(db.as(null), beacon)).toBeNull();
    await age(id, 25);
    expect(await getCourtHill(db.as(null), beacon)).toMatchObject({ streak: 1, players: [{ name: "Dee" }] });
    const [result] = await getMyHillResults(db.as(ED));
    expect(result).toMatchObject({ status: "pending", counts: true, can_answer: false });
    await expect(disputeHillMatch(db.as(ED), id)).rejects.toThrow(/Too late to dispute/);
  });

  test("a disputed result never counts", async () => {
    const id = await recordHillMatch(db.as(ED), {
      courtId: beacon, format: "singles", winnerIds: [ED], loserIds: [DEE], score: "11-0",
    });
    await disputeHillMatch(db.as(DEE), id);
    await age(id, 48);
    expect(await getCourtHill(db.as(null), beacon)).toMatchObject({ players: [{ name: "Dee" }] });
    await expect(confirmHillMatch(db.as(DEE), id)).rejects.toThrow(/disputed/);
  });

  test("pending results are private to the players in them", async () => {
    await recordHillMatch(db.as(BO), {
      courtId: oakBay, format: "singles", winnerIds: [BO], loserIds: [CY], score: "11-7",
    });
    expect(await db.as(null).sql(`select * from public.hill_matches where court_id = $1`, [oakBay])).toHaveLength(0);
    expect(await db.as(ANA).sql(`select * from public.hill_matches where court_id = $1`, [oakBay])).toHaveLength(0);
    expect(await db.as(CY).sql(`select * from public.hill_matches where court_id = $1`, [oakBay])).toHaveLength(1);
  });
});

describe("doubles", () => {
  test("a 2 v 2 result makes both winners kings, and one opponent's confirmation is enough", async () => {
    await db.pg.query(`delete from public.hill_matches where court_id = $1`, [oakBay]);
    const id = await recordHillMatch(db.as(ANA), {
      courtId: oakBay, format: "doubles", winnerIds: [ANA, BO], loserIds: [CY, DEE], score: "11-6",
    });
    await expect(confirmHillMatch(db.as(BO), id)).rejects.toThrow(/other side confirms/); // Ana's partner
    await confirmHillMatch(db.as(DEE), id);

    const hill = await getCourtHill(db.as(null), oakBay);
    expect(hill).toMatchObject({ streak: 1, players: [{ name: "Ana" }, { name: "Bo" }] });
    const streaks = await db.as(null).sql<{ player_id: string; streak: number }>(
      `select player_id, streak from public.hill_streaks where court_id = $1 order by player_id`, [oakBay],
    );
    expect(streaks).toEqual([{ player_id: ANA, streak: 1 }, { player_id: BO, streak: 1 }]);
  });

  test("the streak belongs to the pair: a new partner starts a new one", async () => {
    const again = await recordHillMatch(db.as(BO), {
      courtId: oakBay, format: "doubles", winnerIds: [BO, ANA], loserIds: [CY, ED], score: "11-8",
    });
    await confirmHillMatch(db.as(ED), again);
    expect((await getCourtHill(db.as(null), oakBay))!.streak).toBe(2);

    const newPair = await recordHillMatch(db.as(ANA), {
      courtId: oakBay, format: "doubles", winnerIds: [ANA, CY], loserIds: [BO, DEE], score: "11-9",
    });
    await confirmHillMatch(db.as(BO), newPair);
    expect(await getCourtHill(db.as(null), oakBay)).toMatchObject({ streak: 1, players: [{ name: "Ana" }, { name: "Cy" }] });
  });

  test("sides must be the right size, with nobody on both", async () => {
    const base = { courtId: oakBay, score: "11-5" };
    await expect(
      recordHillMatch(db.as(ANA), { ...base, format: "doubles", winnerIds: [ANA], loserIds: [BO] }),
    ).rejects.toThrow(/Doubles is 2 v 2/);
    await expect(
      recordHillMatch(db.as(ANA), { ...base, format: "singles", winnerIds: [ANA, BO], loserIds: [CY] }),
    ).rejects.toThrow(/Singles is 1 v 1/);
    await expect(
      recordHillMatch(db.as(ANA), { ...base, format: "doubles", winnerIds: [ANA, BO], loserIds: [BO, CY] }),
    ).rejects.toThrow(/one side/);
  });
});

describe("who can record", () => {
  test("only players in the result, and never signed out", async () => {
    await expect(
      recordHillMatch(db.as(ED), { courtId: topaz, format: "singles", winnerIds: [ANA], loserIds: [BO], score: "11-1" }),
    ).rejects.toThrow(/played in/);
    const { error } = await db.as(null).rpc("record_hill_match", {
      p_court_id: topaz, p_format: "singles", p_winner_ids: [ANA], p_loser_ids: [BO], p_score: "11-1",
    });
    expect(error?.message).toMatch(/permission denied/);
  });

  test("results can't be written or edited directly", async () => {
    await expect(
      db.as(ANA).sql(`update public.hill_matches set status = 'confirmed'`),
    ).rejects.toThrow(/permission denied/);
    await expect(
      db.as(ANA).sql(`insert into public.hill_match_players (match_id, player_id, won)
                      select id, $1, true from public.hill_matches limit 1`, [ANA]),
    ).rejects.toThrow(/permission denied/);
  });
});
