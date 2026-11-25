// Who can see which courts a player plays at. Knowing someone's home court
// (plus their usual play times) tells you where to find them.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { askToPlay, blockPlayer, getForYou, getPlayerProfile, respondToRequest } from "@/features/matching/data";
import { getCourtDetail } from "@/features/events-map/data";
import { addCourt, addPlayer, createTestDb, uid, type TestDb } from "./harness";

let db: TestDb;
let topaz: string;
const ANA = uid(1); // shows her courts to any player (the default)
const BO = uid(2); // only shows his courts to connections
const CY = uid(3);
const DEE = uid(4);

beforeAll(async () => {
  db = await createTestDb();
  await addCourt(db, "topaz");
  topaz = (await db.pg.query<{ id: string }>(`select id from public.courts`)).rows[0].id;
  await addPlayer(db, { id: ANA, name: "Ana", homeCourtSlug: "topaz" });
  await addPlayer(db, { id: BO, name: "Bo", homeCourtSlug: "topaz" });
  await addPlayer(db, { id: CY, name: "Cy", homeCourtSlug: "topaz" });
  await addPlayer(db, { id: DEE, name: "Dee" });
  await db.as(BO).sql(`update public.players set courts_visibility = 'connections' where id = $1`, [BO]);
});
afterAll(() => db.close());

const courtPlayers = async (viewer: string | null) =>
  (await getCourtDetail(db.as(viewer), topaz))!.players.map((p) => p.name).sort();

describe("seeing someone's courts", () => {
  test("signed-out visitors never see who plays where", async () => {
    expect(await courtPlayers(null)).toEqual([]);
    const cards = await db.as(null).sql<{ home_court_id: string | null; court_ids: string[] }>(
      `select home_court_id, court_ids from public.player_cards`,
    );
    expect(cards.every((c) => c.home_court_id === null && c.court_ids.length === 0)).toBe(true);
    expect(await getPlayerProfile(db.as(null), ANA)).toMatchObject({ courts: [], home_court_id: null });
  });

  test("the raw court list is yours alone", async () => {
    await expect(db.as(null).sql(`select * from public.player_courts`)).rejects.toThrow(/permission denied/);
    const rows = await db.as(DEE).sql(`select * from public.player_courts`);
    expect(rows).toEqual([]);
    expect(await db.as(ANA).sql(`select * from public.player_courts`)).toHaveLength(1);
  });

  test("signed-in players see courts of people who share them with any player", async () => {
    expect(await courtPlayers(DEE)).toEqual(["Ana", "Cy"]);
    expect((await getPlayerProfile(db.as(DEE), ANA))!.courts).toEqual([
      { id: topaz, name: "topaz", is_home: true },
    ]);
    // Bo is connections-only, so Dee sees his card but not where he plays.
    expect(await getPlayerProfile(db.as(DEE), BO)).toMatchObject({ name: "Bo", courts: [], home_court_id: null });
  });

  test("a connection (an accepted play request) can see a connections-only player's courts", async () => {
    await respondToRequest(db.as(BO), await askToPlay(db.as(DEE), BO), true);
    expect(await courtPlayers(DEE)).toEqual(["Ana", "Bo", "Cy"]);
    expect((await getPlayerProfile(db.as(DEE), BO))!.home_court_id).toBe(topaz);
    expect(await courtPlayers(CY)).toEqual(["Ana"]); // Cy still isn't connected to Bo
  });

  test("blocking hides your courts both ways", async () => {
    await blockPlayer(db.as(ANA), CY);
    expect(await courtPlayers(CY)).toEqual([]);
    expect(await courtPlayers(ANA)).toEqual([]); // Cy is blocked; Bo isn't connected to Ana
    const cards = await db.as(CY).sql<{ id: string; home_court_id: string | null }>(
      `select id, home_court_id from public.player_cards where id = $1`, [ANA],
    );
    expect(cards[0].home_court_id).toBeNull();
  });

  test("you always see your own courts, and ranking still uses them", async () => {
    const [me] = await db.as(BO).sql<{ home_court_id: string }>(
      `select home_court_id from public.player_cards where id = $1`, [BO],
    );
    expect(me.home_court_id).toBe(topaz);
    const forYou = await getForYou(db.as(DEE));
    const bo = [...forYou.best_matches, ...forYou.everyone_else].find((e) => e.id === BO);
    expect(bo).toBeDefined();
  });
});
