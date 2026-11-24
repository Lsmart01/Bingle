// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBoard, checkScore, courtRegular, crownChanges, kingOf, winStreak } from "./logic.ts";
import type { Crown, Game } from "./types.ts";

const NOW = new Date("2026-11-24T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

let nextId = 1;
function game(p: Partial<Game> & Pick<Game, "teamA" | "teamB" | "scoreA" | "scoreB">): Game {
  return {
    id: `g${nextId++}`,
    courtId: "c1",
    format: p.teamA.length === 2 ? "doubles" : "singles",
    status: "confirmed",
    loggedBy: p.teamA[0],
    playedAt: daysAgo(1),
    respondedBy: null,
    respondedAt: null,
    ...p,
  };
}

test("checkScore: to 11, win by 2", () => {
  assert.equal(checkScore(11, 0), null);
  assert.equal(checkScore(11, 9), null);
  assert.equal(checkScore(12, 10), null);
  assert.equal(checkScore(15, 13), null);
  assert.match(checkScore(11, 10)!, /win by 2/);
  assert.match(checkScore(10, 8)!, /at least 11/);
  assert.match(checkScore(13, 10)!, /2-point lead/);
  assert.match(checkScore(12, 9)!, /2-point lead/);
  assert.match(checkScore(9, 11)!, /higher/);
  assert.match(checkScore(11, 11)!, /higher/);
  assert.match(checkScore(11.5, 3)!, /whole/);
});

test("board: wins first, point difference breaks ties, only confirmed games in 30 days", () => {
  const games = [
    game({ teamA: ["a"], teamB: ["b"], scoreA: 11, scoreB: 9 }), // a +2
    game({ teamA: ["c"], teamB: ["d"], scoreA: 11, scoreB: 2 }), // c +9
    game({ teamA: ["a"], teamB: ["d"], scoreA: 11, scoreB: 5, status: "pending" }),
    game({ teamA: ["a"], teamB: ["d"], scoreA: 11, scoreB: 5, status: "disputed" }),
    game({ teamA: ["b"], teamB: ["a"], scoreA: 11, scoreB: 0, playedAt: daysAgo(31) }),
    game({ teamA: ["b"], teamB: ["a"], scoreA: 11, scoreB: 0, courtId: "other" }),
  ];
  const board = buildBoard(games, "c1", "singles", NOW);
  assert.deepEqual(
    board.map((r) => [r.key, r.wins, r.losses, r.pointDiff]),
    [
      ["c", 1, 0, 9],
      ["a", 1, 0, 2],
      ["b", 0, 1, -2],
      ["d", 0, 1, -9],
    ],
  );
  assert.equal(kingOf(board)?.key, "c");
});

test("board: doubles ranks teams, whichever order the partners were entered", () => {
  const games = [
    game({ teamA: ["a", "b"], teamB: ["c", "d"], scoreA: 11, scoreB: 6 }),
    game({ teamA: ["d", "c"], teamB: ["b", "a"], scoreA: 11, scoreB: 7 }),
    game({ teamA: ["b", "a"], teamB: ["c", "d"], scoreA: 11, scoreB: 4 }),
  ];
  const board = buildBoard(games, "c1", "doubles", NOW);
  assert.deepEqual(board.map((r) => [r.key, r.wins, r.losses]), [
    ["a+b", 2, 1],
    ["c+d", 1, 2],
  ]);
  assert.equal(buildBoard(games, "c1", "singles", NOW).length, 0);
});

test("board: the king keeps first place when exactly level", () => {
  const games = [
    game({ teamA: ["a"], teamB: ["x"], scoreA: 11, scoreB: 5 }),
    game({ teamA: ["b"], teamB: ["y"], scoreA: 11, scoreB: 5 }),
  ];
  assert.equal(buildBoard(games, "c1", "singles", NOW, "b")[0].key, "b");
  assert.equal(buildBoard(games, "c1", "singles", NOW, "a")[0].key, "a");
});

test("crowns: start, move to whoever takes first, and end when no one has won", () => {
  const g1 = [game({ teamA: ["a"], teamB: ["b"], scoreA: 11, scoreB: 3 })];
  assert.deepEqual(crownChanges(g1, [], ["c1"], NOW), [
    { kind: "start", courtId: "c1", format: "singles", playerIds: ["a"] },
  ]);

  const held: Crown[] = [
    { id: "k1", courtId: "c1", format: "singles", playerIds: ["a"], startedAt: daysAgo(1), endedAt: null },
  ];
  assert.deepEqual(crownChanges(g1, held, ["c1"], NOW), []);

  const g2 = [
    ...g1,
    game({ teamA: ["b"], teamB: ["a"], scoreA: 11, scoreB: 1 }),
    game({ teamA: ["b"], teamB: ["c"], scoreA: 11, scoreB: 1 }),
  ];
  assert.deepEqual(crownChanges(g2, held, ["c1"], NOW), [
    { kind: "end", crownId: "k1" },
    { kind: "start", courtId: "c1", format: "singles", playerIds: ["b"] },
  ]);

  // All of a's games age out of the 30-day window: the crown ends with no new king.
  const old = [game({ teamA: ["a"], teamB: ["b"], scoreA: 11, scoreB: 3, playedAt: daysAgo(40) })];
  assert.deepEqual(crownChanges(old, held, ["c1"], NOW), [{ kind: "end", crownId: "k1" }]);
});

test("crowns: doubles crown goes to both players", () => {
  const games = [game({ teamA: ["b", "a"], teamB: ["c", "d"], scoreA: 11, scoreB: 3 })];
  assert.deepEqual(crownChanges(games, [], ["c1"], NOW), [
    { kind: "start", courtId: "c1", format: "doubles", playerIds: ["a", "b"] },
  ]);
});

test("winStreak: counts confirmed wins back from the latest game", () => {
  const games = [
    game({ teamA: ["a"], teamB: ["b"], scoreA: 3, scoreB: 11, playedAt: daysAgo(10) }), // loss
    game({ teamA: ["a"], teamB: ["b"], scoreA: 11, scoreB: 3, playedAt: daysAgo(9) }),
    game({ teamA: ["b"], teamB: ["a"], scoreA: 4, scoreB: 11, playedAt: daysAgo(8) }), // win on side B
    game({ teamA: ["a"], teamB: ["b"], scoreA: 2, scoreB: 11, playedAt: daysAgo(7), status: "disputed" }),
    game({ teamA: ["a", "c"], teamB: ["b", "d"], scoreA: 11, scoreB: 9, playedAt: daysAgo(6) }),
  ];
  assert.equal(winStreak(games, "a"), 3);
  assert.equal(winStreak(games, "b"), 0);
  assert.equal(winStreak(games, "nobody"), 0);
});

test("courtRegular: most confirmed games at the court in 30 days", () => {
  const games = [
    game({ teamA: ["a"], teamB: ["b"], scoreA: 11, scoreB: 3 }),
    game({ teamA: ["a"], teamB: ["c"], scoreA: 11, scoreB: 3 }),
    game({ teamA: ["b", "c"], teamB: ["a", "d"], scoreA: 11, scoreB: 3 }),
    game({ teamA: ["b"], teamB: ["c"], scoreA: 11, scoreB: 3, status: "pending" }),
    game({ teamA: ["b"], teamB: ["c"], scoreA: 11, scoreB: 3, playedAt: daysAgo(45) }),
  ];
  assert.deepEqual(courtRegular(games, "c1", NOW), { playerIds: ["a"], games: 3 });
  assert.equal(courtRegular(games, "empty", NOW), null);
});
