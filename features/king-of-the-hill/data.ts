// King of the hill reads and writes. Ben owns this feature: the hill_matches
// and hill_match_players tables and the hill_streaks view are a starting point
// he can reshape. Matchmaking only relies on hill_streaks having
// (court_id, player_id, streak).
//
// A result is 1 v 1 (singles) or 2 v 2 (doubles, mixed). It counts once
// someone on the other side confirms it, or automatically after 24 hours if
// nobody on that side disputes it.
import type { HillResultStatus, PlayFormat, PlayerCard } from "@/shared/models";
import { call, type RpcClient } from "@/shared/supabase/rpc";

/** Whoever holds a court's hill: one player in singles, two in doubles. */
export type CourtHill = { players: PlayerCard[]; streak: number };

/** The current king(s) of a court and their streak, or null if nobody holds it yet. */
export async function getCourtHill(client: RpcClient, courtId: string): Promise<CourtHill | null> {
  const detail = await call<{ hill: CourtHill | null } | null>(client, "court_detail", { p_court_id: courtId });
  return detail?.hill ?? null;
}

export type HillResult = {
  id: string;
  court_id: string;
  format: PlayFormat;
  score: string;
  played_at: string;
  recorded_by: string;
  status: HillResultStatus;
  /** Whether it counts toward streaks yet. */
  counts: boolean;
  /** When an unanswered result starts counting. Null once answered. */
  auto_confirms_at: string | null;
  /** You're on the side that didn't record it and can still confirm or dispute. */
  can_answer: boolean;
  winner_ids: string[];
  loser_ids: string[];
};

/** Results you played in over the last 30 days, newest first. */
export const getMyHillResults = (client: RpcClient) => call<HillResult[]>(client, "my_hill_results");

/** Record a result you played in. Returns its id. */
export const recordHillMatch = (
  client: RpcClient,
  result: {
    courtId: string;
    format: PlayFormat;
    winnerIds: string[];
    loserIds: string[];
    score: string;
    playedAt?: string;
  },
) =>
  call<string>(client, "record_hill_match", {
    p_court_id: result.courtId,
    p_format: result.format,
    p_winner_ids: result.winnerIds,
    p_loser_ids: result.loserIds,
    p_score: result.score,
    ...(result.playedAt ? { p_played_at: result.playedAt } : {}),
  });

/** Confirm a result the other side recorded. */
export const confirmHillMatch = (client: RpcClient, matchId: string) =>
  call<boolean>(client, "confirm_hill_match", { p_match_id: matchId });

/** Dispute a result the other side recorded, within 24 hours. A disputed result never counts. */
export const disputeHillMatch = (client: RpcClient, matchId: string) =>
  call<boolean>(client, "dispute_hill_match", { p_match_id: matchId });
