// King of the hill reads. Ben owns this feature: the hill_matches table and
// hill_streaks view are a starting point he can reshape. Matchmaking only
// relies on hill_streaks having (court_id, player_id, streak).
import type { PlayerCard } from "@/shared/models";
import { call, type RpcClient } from "@/shared/supabase/rpc";

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
