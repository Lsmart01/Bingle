// Reads and writes for King of the Court. Server only.
// Pages and actions call these; these call the store (local file for now).

import { buildBoard, checkScore, courtRegular, crownChanges, hasFlame, sideKey, winStreak } from "./logic";
import { readDb, updateDb, type Db } from "./store";
import type { Court, Crown, Format, Game, Player } from "./types";
import type { PlayerCard } from "@/shared/models";
import { call, type RpcClient } from "@/shared/supabase/rpc";

// ---------------------------------------------------------------- crowns

/** Ends and starts crowns so they match who's first on each board right now. */
function applyCrownChanges(db: Db, now: Date): boolean {
  const changes = crownChanges(db.games, db.crowns, db.courts.map((c) => c.id), now);
  for (const change of changes) {
    if (change.kind === "end") {
      const crown = db.crowns.find((c) => c.id === change.crownId);
      if (crown) crown.endedAt = now.toISOString();
    } else {
      db.crowns.push({
        id: crypto.randomUUID(),
        courtId: change.courtId,
        format: change.format,
        playerIds: change.playerIds,
        startedAt: now.toISOString(),
        endedAt: null,
      });
    }
  }
  return changes.length > 0;
}

/**
 * Loads the data with crowns brought up to date. Crowns can change without
 * anyone logging a game, when the king's wins drop out of the 30-day window,
 * so this checks on every read.
 */
async function loadCurrent(now: Date): Promise<Db> {
  const db = await readDb();
  if (crownChanges(db.games, db.crowns, db.courts.map((c) => c.id), now).length === 0) return db;
  return updateDb((fresh) => {
    applyCrownChanges(fresh, now);
    return fresh;
  });
}

// ---------------------------------------------------------------- reads

export type PlayerChip = { id: string; name: string; flame: boolean; crowned: boolean };

export type HillView = {
  courts: Court[];
  court: Court;
  format: Format;
  rows: { rank: number; players: PlayerChip[]; wins: number; losses: number; pointDiff: number; isKing: boolean }[];
  kingSince: string | null;
  regular: { players: PlayerChip[]; games: number } | null;
  /** Games the viewer needs to confirm or dispute. */
  toConfirm: GameSummary[];
  /** Games the viewer logged that the other side hasn't confirmed yet. */
  waiting: GameSummary[];
};

export type GameSummary = {
  id: string;
  courtName: string;
  format: Format;
  teamA: PlayerChip[];
  teamB: PlayerChip[];
  scoreA: number;
  scoreB: number;
  playedAt: string;
};

function chipMaker(db: Db) {
  const byId = new Map(db.players.map((p) => [p.id, p]));
  const crowned = new Set(db.crowns.filter((c) => c.endedAt === null).flatMap((c) => c.playerIds));
  return (id: string): PlayerChip => ({
    id,
    name: byId.get(id)?.name ?? "Unknown player",
    flame: hasFlame(db.games, id),
    crowned: crowned.has(id),
  });
}

function summarize(db: Db, chip: (id: string) => PlayerChip, g: Game): GameSummary {
  return {
    id: g.id,
    courtName: db.courts.find((c) => c.id === g.courtId)?.name ?? "Unknown court",
    format: g.format,
    teamA: g.teamA.map(chip),
    teamB: g.teamB.map(chip),
    scoreA: g.scoreA,
    scoreB: g.scoreB,
    playedAt: g.playedAt,
  };
}

export async function getPlayers(): Promise<Player[]> {
  return (await readDb()).players;
}

export async function getCourts(): Promise<Court[]> {
  return (await readDb()).courts;
}

export async function getHillView(courtId: string | undefined, format: Format, viewerId: string): Promise<HillView> {
  const now = new Date();
  const db = await loadCurrent(now);
  const court = db.courts.find((c) => c.id === courtId) ?? db.courts[0];
  const chip = chipMaker(db);

  const crown = db.crowns.find((c) => c.courtId === court.id && c.format === format && c.endedAt === null);
  const kingKey = crown ? sideKey(crown.playerIds) : null;
  const board = buildBoard(db.games, court.id, format, now, kingKey);
  const regular = courtRegular(db.games, court.id, now);

  const newestFirst = (a: Game, b: Game) => b.playedAt.localeCompare(a.playedAt);
  const pending = db.games.filter((g) => g.status === "pending").sort(newestFirst);

  return {
    courts: db.courts,
    court,
    format,
    rows: board.map((r) => ({
      rank: r.rank,
      players: r.playerIds.map(chip),
      wins: r.wins,
      losses: r.losses,
      pointDiff: r.pointDiff,
      isKing: r.key === kingKey,
    })),
    kingSince: crown?.startedAt ?? null,
    regular: regular && { players: regular.playerIds.map(chip), games: regular.games },
    toConfirm: pending.filter((g) => g.teamB.includes(viewerId)).map((g) => summarize(db, chip, g)),
    waiting: pending.filter((g) => g.teamA.includes(viewerId)).map((g) => summarize(db, chip, g)),
  };
}

export type ProfileView = {
  player: Player;
  crowned: boolean;
  streak: number;
  flame: boolean;
  currentCrowns: (Crown & { courtName: string })[];
  pastCrowns: (Crown & { courtName: string })[];
  regularAt: { courtName: string; games: number }[];
};

export async function getProfile(playerId: string): Promise<ProfileView | null> {
  const now = new Date();
  const db = await loadCurrent(now);
  const player = db.players.find((p) => p.id === playerId);
  if (!player) return null;

  const courtName = (id: string) => db.courts.find((c) => c.id === id)?.name ?? "Unknown court";
  const theirs = db.crowns
    .filter((c) => c.playerIds.includes(playerId))
    .map((c) => ({ ...c, courtName: courtName(c.courtId) }))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const currentCrowns = theirs.filter((c) => c.endedAt === null);
  const streak = winStreak(db.games, playerId);

  return {
    player,
    crowned: currentCrowns.length > 0,
    streak,
    flame: hasFlame(db.games, playerId),
    currentCrowns,
    pastCrowns: theirs.filter((c) => c.endedAt !== null),
    regularAt: db.courts.flatMap((court) => {
      const reg = courtRegular(db.games, court.id, now);
      return reg?.playerIds.includes(playerId) ? [{ courtName: court.name, games: reg.games }] : [];
    }),
  };
}

// ---------------------------------------------------------------- writes

export type LogGameInput = {
  loggedBy: string;
  courtId: string;
  format: Format;
  partnerId: string | null;
  opponentIds: string[];
  result: "win" | "loss";
  /** The logger's side's score, and the other side's. */
  ourScore: number;
  theirScore: number;
};

/** Saves a new game as pending. Returns an error message, or null on success. */
export async function logGame(input: LogGameInput): Promise<string | null> {
  const won = input.result === "win";
  const [winning, losing] = won ? [input.ourScore, input.theirScore] : [input.theirScore, input.ourScore];
  if (won && input.ourScore < input.theirScore) return "You picked Win, but your score is lower. Check the score or pick Loss.";
  if (!won && input.ourScore > input.theirScore) return "You picked Loss, but your score is higher. Check the score or pick Win.";
  const scoreError = checkScore(winning, losing);
  if (scoreError) return scoreError;

  return updateDb((db) => {
    const known = new Set(db.players.map((p) => p.id));
    if (!db.courts.some((c) => c.id === input.courtId)) return "Pick a court.";

    const teamA = input.format === "doubles" ? [input.loggedBy, input.partnerId ?? ""] : [input.loggedBy];
    const teamB = input.opponentIds;
    const needed = input.format === "doubles" ? 2 : 1;

    if (input.format === "doubles" && !input.partnerId) return "Pick your partner.";
    if (teamB.length !== needed || teamB.some((id) => !id)) {
      return input.format === "doubles" ? "Pick both opponents." : "Pick your opponent.";
    }
    const everyone = [...teamA, ...teamB];
    if (everyone.some((id) => !known.has(id))) return "One of those players doesn't exist.";
    if (new Set(everyone).size !== everyone.length) return "Each player can only be in the game once.";

    db.games.push({
      id: crypto.randomUUID(),
      courtId: input.courtId,
      format: input.format,
      teamA,
      teamB,
      scoreA: input.ourScore,
      scoreB: input.theirScore,
      status: "pending",
      loggedBy: input.loggedBy,
      playedAt: new Date().toISOString(),
      respondedBy: null,
      respondedAt: null,
    });
    return null;
  });
}

/** The other side confirms or disputes a pending game. Returns an error message, or null. */
export async function respondToGame(gameId: string, playerId: string, response: "confirm" | "dispute") {
  return updateDb((db) => {
    const game = db.games.find((g) => g.id === gameId);
    if (!game) return "That game doesn't exist.";
    if (!game.teamB.includes(playerId)) return "Only the other side can confirm or dispute this game.";
    if (game.status !== "pending") return "This game has already been answered.";

    const now = new Date();
    game.status = response === "confirm" ? "confirmed" : "disputed";
    game.respondedBy = playerId;
    game.respondedAt = now.toISOString();
    applyCrownChanges(db, now);
    return null;
  });
}

// ---------------------------------------------------------------- Supabase (from Graeme's backend)


/** The current king of a court and their streak, or null if nobody holds it yet. */
export async function getCourtHill(
  client: RpcClient,
  courtId: string,
): Promise<{ player: PlayerCard; streak: number } | null> {
  const detail = await call<{ hill: { player: PlayerCard; streak: number } | null } | null>(
    client,
    "court_detail",
    { p_court_id: courtId },
  );
  return detail?.hill ?? null;
}

/** Confirm a result you played in. It counts once both players confirm. */
export const confirmHillMatch = (client: RpcClient, matchId: string) =>
  call<boolean>(client, "confirm_hill_match", { p_match_id: matchId });
