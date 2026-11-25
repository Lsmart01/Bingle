// The local seed data loads, and the directory looks sensible with it.
import { afterAll, beforeAll, expect, test } from "vitest";
import { getForYou, getRankedForYou } from "@/features/matching/data";
import { getCourtDetail, getCourts } from "@/features/events-map/data";
import { getCourtHill } from "@/features/king-of-the-hill/data";
import { createTestDb, type TestDb } from "./harness";

let db: TestDb;
const seedId = (n: number) => `00000000-0000-4000-a000-${String(n).padStart(12, "0")}`;
const MAYA = seedId(1);

beforeAll(async () => {
  db = await createTestDb({ seed: true });
});
afterAll(() => db.close());

test("seed loads courts, players, crews and games", async () => {
  const courts = await getCourts(db.as(null));
  expect(courts.length).toBe(29);
  const counts = await db.pg.query<Record<string, number>>(
    `select (select count(*)::int from public.players) as players,
            (select count(*)::int from public.crews) as crews,
            (select count(*)::int from public.games) as games`,
  );
  expect(counts.rows[0]).toEqual({ players: 30, crews: 2, games: 3 });
});

test("Maya's directory: everyone is somewhere, nobody twice, best matches first", async () => {
  const ranked = await getRankedForYou(db.as(MAYA));
  const all = [...ranked.best_matches, ...ranked.everyone_else, ...ranked.not_looking];
  const playerIds = all.filter((r) => r.entry.kind === "player").map((r) => r.entry.id);
  expect(new Set(playerIds).size).toBe(29); // everyone but Maya
  expect(playerIds).not.toContain(MAYA);
  expect(ranked.best_matches.length).toBeGreaterThan(0);
  for (const r of ranked.best_matches) expect(r.score).toBeGreaterThanOrEqual(60);

  // Maya prefers women and non-binary players aged 25–40, so men can't be best matches
  // and Sam ("prefer not to say") is never hidden.
  const names = (list: typeof all) => list.map((r) => ("name" in r.entry ? r.entry.name : ""));
  expect(names(ranked.best_matches)).not.toContain("Theo");
  expect(names(all)).toContain("Sam");
  // Maya's own game isn't in her strip; the other two are.
  expect(ranked.games).toHaveLength(2);
});

test("signed-out visitors see the whole directory", async () => {
  const forYou = await getForYou(db.as(null));
  expect(forYou.best_matches).toEqual([]);
  expect(forYou.everyone_else.filter((e) => e.kind === "player").length + forYou.not_looking.length).toBe(30);
  expect(forYou.games).toHaveLength(3);
});

test("Topaz shows Ben as king on a 2-game streak", async () => {
  const topaz = (await getCourts(db.as(null))).find((c) => c.slug === "topaz-park")!;
  const hill = await getCourtHill(db.as(null), topaz.id);
  expect(hill).toMatchObject({ streak: 2, players: [{ name: "Ben" }] });
  const detail = await getCourtDetail(db.as(MAYA), topaz.id);
  expect(detail!.players.map((p) => p.name)).toEqual(expect.arrayContaining(["Ben", "Sam", "Mia"]));
});
