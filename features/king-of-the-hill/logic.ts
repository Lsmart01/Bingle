// The rules of King of the Court, as plain functions with no database access,
// so they're easy to test (see logic.test.ts) and reuse once Supabase is in.

import type { Crown, Format, Game } from "./types";

export const WINDOW_DAYS = 30;
export const STREAK_FOR_FLAME = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------- scores

/**
 * Checks a finished game's score: games go to 11 and must be won by 2.
 * So 11–0 to 11–9 is a normal win, and past 10–10 the winner needs exactly
 * a 2-point lead (12–10, 13–11, ...). Returns an error message, or null if it's fine.
 */
export function checkScore(winning: number, losing: number): string | null {
  if (!Number.isInteger(winning) || !Number.isInteger(losing)) return "Scores must be whole numbers.";
  if (winning < 0 || losing < 0) return "Scores can't be negative.";
  if (winning <= losing) return "The winning score has to be higher than the losing score.";
  if (winning < 11) return "Games go to 11, so the winner needs at least 11.";
  if (winning === 11) {
    if (losing > 9) return "At 11–10 the game isn't over: you have to win by 2.";
    return null;
  }
  // Past 11, the game only ends when someone is ahead by exactly 2.
  if (winning - losing !== 2) {
    return `A game that goes past 11 ends at a 2-point lead, so ${winning} should be against ${winning - 2}.`;
  }
  return null;
}

// ---------------------------------------------------------------- helpers

/** A stable key for a side: one player id, or two sorted ids for doubles. */
export function sideKey(playerIds: string[]): string {
  return [...playerIds].sort().join("+");
}

function inWindow(game: Game, now: Date): boolean {
  const age = now.getTime() - new Date(game.playedAt).getTime();
  return age >= 0 && age <= WINDOW_DAYS * DAY_MS;
}

function byPlayedAt(a: Game, b: Game): number {
  return a.playedAt.localeCompare(b.playedAt);
}

// ---------------------------------------------------------------- leaderboard

export type BoardRow = {
  rank: number;
  key: string;
  playerIds: string[];
  wins: number;
  losses: number;
  pointDiff: number;
};

/**
 * The leaderboard for one court and format: confirmed games from the last 30
 * days, most wins first, point difference breaking ties.
 *
 * If the current crown holder is exactly level with someone (same wins and
 * same point difference), the holder stays above them: you have to beat the
 * king to take the crown, not just match them.
 */
export function buildBoard(
  games: Game[],
  courtId: string,
  format: Format,
  now: Date,
  currentKingKey: string | null = null,
): BoardRow[] {
  const rows = new Map<string, Omit<BoardRow, "rank">>();

  for (const g of games) {
    if (g.status !== "confirmed" || g.courtId !== courtId || g.format !== format || !inWindow(g, now)) continue;
    const aWon = g.scoreA > g.scoreB;
    for (const [side, won, diff] of [
      [g.teamA, aWon, g.scoreA - g.scoreB],
      [g.teamB, !aWon, g.scoreB - g.scoreA],
    ] as const) {
      const key = sideKey(side);
      const row = rows.get(key) ?? { key, playerIds: [...side].sort(), wins: 0, losses: 0, pointDiff: 0 };
      if (won) row.wins += 1;
      else row.losses += 1;
      row.pointDiff += diff;
      rows.set(key, row);
    }
  }

  return [...rows.values()]
    .sort(
      (a, b) =>
        b.wins - a.wins ||
        b.pointDiff - a.pointDiff ||
        Number(b.key === currentKingKey) - Number(a.key === currentKingKey) ||
        a.key.localeCompare(b.key),
    )
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

/** Who should hold the crown on this board: first place, as long as they've won a game. */
export function kingOf(board: BoardRow[]): BoardRow | null {
  const top = board[0];
  return top && top.wins > 0 ? top : null;
}

// ---------------------------------------------------------------- crowns

export type CrownChange =
  | { kind: "end"; crownId: string }
  | { kind: "start"; courtId: string; format: Format; playerIds: string[] };

/**
 * Compares who's first on each board with the crowns currently held, and says
 * which crowns to end and which to start. Ended crowns stay as crown history.
 */
export function crownChanges(
  games: Game[],
  crowns: Crown[],
  courtIds: string[],
  now: Date,
): CrownChange[] {
  const changes: CrownChange[] = [];
  for (const courtId of courtIds) {
    for (const format of ["singles", "doubles"] as const) {
      const held = crowns.find((c) => c.courtId === courtId && c.format === format && c.endedAt === null);
      const heldKey = held ? sideKey(held.playerIds) : null;
      const king = kingOf(buildBoard(games, courtId, format, now, heldKey));
      if ((king?.key ?? null) === heldKey) continue;
      if (held) changes.push({ kind: "end", crownId: held.id });
      if (king) changes.push({ kind: "start", courtId, format, playerIds: king.playerIds });
    }
  }
  return changes;
}

// ---------------------------------------------------------------- streaks

/** How many confirmed games in a row this player has won, counting back from their latest. */
export function winStreak(games: Game[], playerId: string): number {
  const theirs = games
    .filter((g) => g.status === "confirmed" && (g.teamA.includes(playerId) || g.teamB.includes(playerId)))
    .sort(byPlayedAt);
  let streak = 0;
  for (let i = theirs.length - 1; i >= 0; i--) {
    const g = theirs[i];
    const onA = g.teamA.includes(playerId);
    const won = onA ? g.scoreA > g.scoreB : g.scoreB > g.scoreA;
    if (!won) break;
    streak += 1;
  }
  return streak;
}

export function hasFlame(games: Game[], playerId: string): boolean {
  return winStreak(games, playerId) >= STREAK_FOR_FLAME;
}

// ---------------------------------------------------------------- court regular

export type CourtRegular = { playerIds: string[]; games: number };

/**
 * Whoever has played the most confirmed games at this court in the last 30
 * days, singles and doubles together. If players are level, they all get it.
 */
export function courtRegular(games: Game[], courtId: string, now: Date): CourtRegular | null {
  const counts = new Map<string, number>();
  for (const g of games) {
    if (g.status !== "confirmed" || g.courtId !== courtId || !inWindow(g, now)) continue;
    for (const id of [...g.teamA, ...g.teamB]) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const most = Math.max(0, ...counts.values());
  if (most === 0) return null;
  const playerIds = [...counts].filter(([, n]) => n === most).map(([id]) => id).sort();
  return { playerIds, games: most };
}
