// Data shapes for King of the Court. These match the tables in
// supabase/migrations/, so moving from the local file store to Supabase
// doesn't change any of the code that uses them.

export type Format = "singles" | "doubles";

export type GameStatus = "pending" | "confirmed" | "disputed";

export type Player = {
  id: string;
  name: string;
  /** True for the test players that ship with the app. Remove before launch. */
  isSample: boolean;
};

export type Court = {
  id: string;
  name: string;
  isSample: boolean;
};

export type Game = {
  id: string;
  courtId: string;
  format: Format;
  /** The side that logged the game: the logger, plus their partner in doubles. */
  teamA: string[];
  /** The other side. They confirm or dispute. */
  teamB: string[];
  scoreA: number;
  scoreB: number;
  status: GameStatus;
  loggedBy: string;
  /** When the game was logged. The 30-day window counts from this. */
  playedAt: string;
  /** Who on team B confirmed or disputed it, and when. */
  respondedBy: string | null;
  respondedAt: string | null;
};

/** One spell as first place at a court. endedAt is null while it's still held. */
export type Crown = {
  id: string;
  courtId: string;
  format: Format;
  /** One player for singles, both players for doubles. */
  playerIds: string[];
  startedAt: string;
  endedAt: string | null;
};
