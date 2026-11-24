// Reads for the live map: every court, and one court's players, king of the
// hill and open games.
import type { Court, PlayFormat, PlayStyle, PlayerCard } from "@/shared/models";
import { call, type RpcClient } from "@/shared/supabase/rpc";
import { MATCH_SETTINGS } from "@/features/matching/scoring/settings";

export type MapCourt = Court & { open_game_count: number };

export const getCourts = (client: RpcClient) => call<MapCourt[]>(client, "list_courts");

export type CourtGame = {
  id: string;
  starts_at: string;
  format: PlayFormat;
  target_level: number | null;
  play_style: PlayStyle | null;
  note: string | null;
  host_id: string;
  guest_count: number;
  player_ids: string[];
  needs: number;
};

export type CourtDetail = {
  court: Court;
  /** People who call it home first, then people who play there. Blocked players are left out. */
  players: (PlayerCard & { is_home: boolean })[];
  hill: { player: PlayerCard; streak: number } | null;
  /** Listed games: not full, within the next 7 days. */
  games: CourtGame[];
};

export async function getCourtDetail(
  client: RpcClient,
  courtId: string,
  now: Date = new Date(),
): Promise<CourtDetail | null> {
  const detail = await call<(Omit<CourtDetail, "games"> & { games: Omit<CourtGame, "needs">[] }) | null>(
    client,
    "court_detail",
    { p_court_id: courtId },
  );
  if (!detail) return null;
  const windowEnd = now.getTime() + MATCH_SETTINGS.gameWindowDays * 86_400_000;
  const games = detail.games
    .map((g) => ({ ...g, needs: (g.format === "singles" ? 2 : 4) - g.player_ids.length - g.guest_count }))
    .filter((g) => g.needs > 0 && new Date(g.starts_at).getTime() <= windowEnd);
  return { ...detail, games };
}
