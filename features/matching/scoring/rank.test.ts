import { describe, expect, test } from "vitest";
import type { Crew, Game, PlayerCard, ViewerProfile } from "@/shared/models";
import { rankForYou, shuffleTies, toForYou, type ForYouInputs, type Ranked } from "./rank";
import { MATCH_SETTINGS } from "./settings";

// Thursday 2026-11-26, noon in Victoria.
const NOW = new Date("2026-11-26T20:00:00Z");
const TODAY = "2026-11-26";
const daysAgo = (n: number) => new Date(Date.parse(`${TODAY}T12:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);

const OAK_BAY = "c-oak-bay";
const TOPAZ = "c-topaz";
const courts = [
  { id: OAK_BAY, name: "Carnarvon Park", area: "Oak Bay" },
  { id: TOPAZ, name: "Topaz Park", area: "Victoria" },
];

function card(id: string, o: Partial<PlayerCard> = {}): PlayerCard {
  return {
    id, name: id, photo_url: `/${id}.jpg`, bio: "", age: 30, gender: "woman",
    skill: 3.5, dupr: null, match_skill: 3.5, play_style: "competitive",
    formats: ["doubles", "mixed"], play_times: ["tue_evening", "thu_evening"],
    open_to_play: true, area: "Oak Bay", last_active_on: TODAY,
    home_court_id: OAK_BAY, court_ids: [OAK_BAY],
    ...o,
  };
}

const viewer: ViewerProfile = {
  ...card("viewer"),
  pref_age_min: null, pref_age_max: null, pref_gender: null,
};

function inputs(o: Partial<ForYouInputs> = {}): ForYouInputs {
  const players = o.players ?? [];
  return {
    viewer, players, directory_player_ids: players.map((p) => p.id), crews: [], games: [], courts,
    hill_streaks: [], blocked_ids: [], ...o,
  };
}

const ids = (list: { entry: { id: string } }[]) => list.map((r) => r.entry.id);

describe("the worked example, end to end", () => {
  test("A (80) and B (75) are both best matches, A's score above B's", () => {
    const a = card("A", {
      formats: ["doubles"], play_times: ["thu_evening"], home_court_id: TOPAZ, court_ids: [TOPAZ, OAK_BAY],
      last_active_on: daysAgo(3), area: "Victoria",
    });
    const b = card("B", {
      match_skill: 4.0, skill: 4.0, play_style: "social", last_active_on: daysAgo(20),
    });
    const r = rankForYou(inputs({ players: [a, b] }), { now: NOW });
    const scores = Object.fromEntries(r.best_matches.map((x) => [x.entry.id, x.score]));
    expect(scores).toEqual({ A: 80, B: 75 });
  });
});

describe("sections", () => {
  test("60+ with no dealbreaker is a best match; the rest are everyone else; nobody is hidden", () => {
    const great = card("great");
    const low = card("low", { play_style: "fun", formats: ["doubles"], play_times: ["sat_morning"], home_court_id: TOPAZ, court_ids: [TOPAZ], area: "Victoria" });
    const gap = card("gap", { match_skill: 5.0 }); // high score otherwise, but a dealbreaker
    const r = rankForYou(inputs({ players: [great, low, gap] }), { now: NOW });
    expect(ids(r.best_matches)).toEqual(["great"]);
    expect(ids(r.everyone_else).sort()).toEqual(["gap", "low"]);
    expect(r.everyone_else.find((x) => x.entry.id === "gap")!.score).toBeGreaterThanOrEqual(60);
  });

  test("players not open to play go to the bottom, in any mode", () => {
    const resting = card("resting", { open_to_play: false });
    for (const strictMode of [false, true]) {
      const r = rankForYou(inputs({ players: [resting, card("x")] }), { now: NOW, settings: { ...MATCH_SETTINGS, strictMode } });
      expect(ids(r.not_looking)).toEqual(["resting"]);
      expect(ids(r.best_matches)).toEqual(["x"]);
    }
  });

  test("strict mode hides dealbreaker hits", () => {
    const players = [card("ok"), card("gap", { match_skill: 5 }), card("old", { last_active_on: daysAgo(90) })];
    const launch = rankForYou(inputs({ players }), { now: NOW });
    const strict = rankForYou(inputs({ players }), { now: NOW, settings: { ...MATCH_SETTINGS, strictMode: true } });
    expect(ids(launch.everyone_else).sort()).toEqual(["gap", "old"]);
    expect(ids(strict.everyone_else)).toEqual([]);
    expect(ids(strict.best_matches)).toEqual(["ok"]);
  });

  test("the viewer never appears in their own results", () => {
    const r = rankForYou(inputs({ players: [card("viewer"), card("x")] }), { now: NOW });
    expect([...ids(r.best_matches), ...ids(r.everyone_else)]).toEqual(["x"]);
  });

  test("blocked players don't appear (the database leaves them out of directory_player_ids)", () => {
    const r = rankForYou(inputs({ players: [card("x"), card("hidden")], directory_player_ids: ["x"] }), { now: NOW });
    expect(ids(r.best_matches)).toEqual(["x"]);
  });

  test("scores never reach the screen", () => {
    const out = toForYou(rankForYou(inputs({ players: [card("x")] }), { now: NOW }));
    expect(JSON.stringify(out)).not.toMatch(/score|breakdown/);
    expect(out.best_matches[0]).toMatchObject({ kind: "player", id: "x", name: "x", age: 30 });
  });
});

describe("gender preference and 'prefer not to say'", () => {
  const picky: ViewerProfile = { ...viewer, pref_gender: ["woman"] };
  const players = [
    card("woman-low", { play_style: "fun", play_times: ["sat_morning"], last_active_on: daysAgo(40) }), // 57
    card("pnts", { gender: "prefer_not_to_say" }),
    card("blank", { gender: null }),
    card("man", { gender: "man" }),
    card("woman-top"),
  ];

  test("launch mode: matches first, then 'prefer not to say', then outside the preference", () => {
    const r = rankForYou(inputs({ viewer: picky, players }), { now: NOW });
    expect(ids(r.best_matches)).toEqual(["woman-top"]);
    const rest = ids(r.everyone_else);
    expect(rest[0]).toBe("woman-low");
    expect(rest.slice(1, 3).sort()).toEqual(["blank", "pnts"]);
    expect(rest[3]).toBe("man");
  });

  test("strict mode never hides 'prefer not to say', only real mismatches", () => {
    const r = rankForYou(inputs({ viewer: picky, players }), { now: NOW, settings: { ...MATCH_SETTINGS, strictMode: true } });
    const all = [...ids(r.best_matches), ...ids(r.everyone_else)];
    expect(all).toContain("pnts");
    expect(all).toContain("blank");
    expect(all).not.toContain("man");
  });

  test("a 'prefer not to say' viewer still sees everyone", () => {
    const pnts: ViewerProfile = { ...viewer, gender: "prefer_not_to_say" };
    const r = rankForYou(inputs({ viewer: pnts, players }), { now: NOW });
    expect(r.best_matches.length + r.everyone_else.length).toBe(players.length);
  });
});

describe("shuffle", () => {
  const r = (id: string, score: number): Ranked<{ id: string }> => ({ entry: { id }, score, breakdown: null });

  test("only entries within 3 points of each other swap places", () => {
    const items = [r("a", 90), r("b", 89), r("c", 88), r("d", 70), r("e", 69)];
    for (const seed of ["s1", "s2", "s3", "s4", "s5"]) {
      const out = ids(shuffleTies(items, () => 0, seed));
      expect(out.slice(0, 3).sort()).toEqual(["a", "b", "c"]);
      expect(out.slice(3).sort()).toEqual(["d", "e"]);
    }
  });

  test("is the same all day for a viewer, and changes between viewers or days", () => {
    const players = Array.from({ length: 12 }, (_, i) => card(`p${i}`));
    const order = (v: ViewerProfile, now: Date) => ids(rankForYou(inputs({ viewer: v, players }), { now }).best_matches);
    const later = new Date(NOW.getTime() + 3 * 3600_000);
    expect(order(viewer, NOW)).toEqual(order(viewer, later));
    const other = { ...viewer, id: "someone-else" };
    const tomorrow = new Date(NOW.getTime() + 86_400_000);
    expect(order(other, NOW)).not.toEqual(order(viewer, NOW));
    expect(order(viewer, tomorrow)).not.toEqual(order(viewer, NOW));
  });
});

describe("crews", () => {
  const members = [card("m1", { match_skill: 3.0, age: 28 }), card("m2", { match_skill: 4.0, age: 40, last_active_on: daysAgo(50) })];
  const crew = (o: Partial<Crew> = {}): Crew => ({
    id: "crew", name: "Thursday crew", home_court_id: OAK_BAY, format: "doubles", play_style: "competitive",
    play_times: ["thu_evening"], is_open: true, guest_count: 1, member_ids: ["m1", "m2"], ...o,
  });

  test("scored on average skill, latest activity and the crew's own details", () => {
    const r = rankForYou(inputs({ players: members, directory_player_ids: [], crews: [crew()] }), { now: NOW });
    const entry = [...r.best_matches, ...r.everyone_else].find((x) => x.entry.id === "crew")!;
    expect(entry.breakdown).toMatchObject({ skill: 25, time: 10, place: 15, style: 15, format: 5, activity: 10 });
    expect(entry.entry).toMatchObject({ kind: "crew", needs: 1, skill: 3.5, has_blocked_player: false });
  });

  test("full, closed or own crews aren't listed", () => {
    const list = (c: Crew) => {
      const r = rankForYou(inputs({ players: members, crews: [c] }), { now: NOW });
      return [...ids(r.best_matches), ...ids(r.everyone_else)].includes("crew");
    };
    expect(list(crew())).toBe(true);
    expect(list(crew({ guest_count: 2 }))).toBe(false);
    expect(list(crew({ is_open: false }))).toBe(false);
    expect(list(crew({ member_ids: ["m1", "viewer"] }))).toBe(false);
  });

  test("a crew meets a gender preference only if every member does", () => {
    const picky = { ...viewer, pref_gender: ["woman" as const] };
    const mixed = [card("m1"), card("m2", { gender: "man" })];
    const r = rankForYou(inputs({ viewer: picky, players: mixed, crews: [crew()] }), { now: NOW });
    const entry = r.everyone_else.find((x) => x.entry.id === "crew")!;
    expect(entry.breakdown!.dealbreakers).toContain("gender");
  });

  test("flags a crew with someone the viewer blocked", () => {
    const r = rankForYou(inputs({ players: members, crews: [crew()], blocked_ids: ["m2"] }), { now: NOW });
    const entry = [...r.best_matches, ...r.everyone_else].find((x) => x.entry.id === "crew")!;
    expect((entry.entry as { has_blocked_player: boolean }).has_blocked_player).toBe(true);
  });
});

describe("games", () => {
  const host = card("host");
  const game = (o: Partial<Game> = {}): Game => ({
    id: "g", court_id: OAK_BAY, starts_at: "2026-11-27T02:00:00Z", // Thu 6pm in Victoria
    format: "doubles", target_level: 3.5, play_style: "competitive", note: null,
    host_id: "host", guest_count: 1, player_ids: ["host"], ...o,
  });
  const listed = (g: Game, v: ViewerProfile | null = viewer) =>
    ids(rankForYou(inputs({ viewer: v, players: [host], games: [g] }), { now: NOW }).games);

  test("time fit uses the game's local day and part of day", () => {
    const r = rankForYou(inputs({ players: [host], games: [game()] }), { now: NOW });
    expect(r.games[0].breakdown).toMatchObject({ time: 20, activity: 10, skill: 25, place: 15, format: 5 });
    expect(r.games[0].entry).toMatchObject({ needs: 2, total_players: 4 });
  });

  test("listed only if upcoming, within 7 days, not full and not the viewer's", () => {
    expect(listed(game())).toEqual(["g"]);
    expect(listed(game({ starts_at: "2026-11-26T19:00:00Z" }))).toEqual([]); // started
    expect(listed(game({ starts_at: "2026-12-04T02:00:00Z" }))).toEqual([]); // 8 days out
    expect(listed(game({ guest_count: 3 }))).toEqual([]); // full
    expect(listed(game({ format: "singles", guest_count: 0 }))).toEqual(["g"]);
    expect(listed(game({ player_ids: ["host", "viewer"] }))).toEqual([]);
  });

  test("games with dealbreakers go to the end of the strip (launch) or are hidden (strict)", () => {
    const games = [game({ id: "far", target_level: 5.0 }), game({ id: "near" })];
    const launch = rankForYou(inputs({ players: [host], games }), { now: NOW });
    expect(ids(launch.games)).toEqual(["near", "far"]);
    const strict = rankForYou(inputs({ players: [host], games }), { now: NOW, settings: { ...MATCH_SETTINGS, strictMode: true } });
    expect(ids(strict.games)).toEqual(["near"]);
  });

  test("a game with someone the viewer blocked still shows, flagged", () => {
    const r = rankForYou(inputs({ players: [host], games: [game()], blocked_ids: ["host"] }), { now: NOW });
    expect(r.games[0].entry.has_blocked_player).toBe(true);
  });
});

describe("signed-out visitors", () => {
  test("see everyone, most recently active first, and games soonest first", () => {
    const players = [card("stale", { last_active_on: daysAgo(45) }), card("fresh")];
    const games: Game[] = [
      { id: "later", court_id: TOPAZ, starts_at: "2026-11-29T18:00:00Z", format: "doubles", target_level: null, play_style: null, note: null, host_id: "fresh", guest_count: 0, player_ids: ["fresh"] },
      { id: "sooner", court_id: TOPAZ, starts_at: "2026-11-27T18:00:00Z", format: "doubles", target_level: null, play_style: null, note: null, host_id: "fresh", guest_count: 0, player_ids: ["fresh"] },
    ];
    const r = rankForYou(inputs({ viewer: null, players, games }), { now: NOW });
    expect(ids(r.best_matches)).toEqual([]);
    expect(ids(r.everyone_else)).toEqual(["fresh", "stale"]);
    expect(ids(r.games)).toEqual(["sooner", "later"]);
  });
});
