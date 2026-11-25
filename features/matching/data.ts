// Matchmaking reads and writes. Every function takes a Supabase client (or
// anything with the same rpc() method) signed in as the viewer; the database
// works out who that is, so nobody can act as someone else.
//
// Run getForYou() on the server (a Server Component or Route Handler) where
// you can: the order comes from scores that players should never see.
import type { PlayFormat, PlayStyle, PlayerCard, RequestStatus, TimeSlot } from "@/shared/models";
import { call, type RpcClient } from "@/shared/supabase/rpc";
import { rankForYou, toForYou, type ForYou, type ForYouInputs, type RankedForYou } from "./scoring/rank";
import type { MatchSettings } from "./scoring/settings";

export type { ForYou, DirectoryEntry, PlayerEntry, CrewEntry, GameEntry, PersonBrief } from "./scoring/rank";

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** The "Find players in Victoria" directory for whoever is signed in (or a signed-out visitor). */
export async function getForYou(
  client: RpcClient,
  options: { now?: Date; settings?: MatchSettings } = {},
): Promise<ForYou> {
  return toForYou(await getRankedForYou(client, options));
}

/** Same as getForYou, with the scores. For tuning and tests only; never send to a browser. */
export async function getRankedForYou(
  client: RpcClient,
  options: { now?: Date; settings?: MatchSettings } = {},
): Promise<RankedForYou> {
  const inputs = await call<ForYouInputs>(client, "for_you_inputs");
  return rankForYou(inputs, options);
}

type CourtInfo = { id: string; name: string; area: string; address: string | null };
type MyStatus = RequestStatus | null;

export type GameDetail = {
  id: string;
  starts_at: string;
  format: PlayFormat;
  target_level: number | null;
  play_style: PlayStyle | null;
  note: string | null;
  host_id: string;
  guest_count: number;
  cancelled_at: string | null;
  court: CourtInfo;
  players: (PlayerCard & { is_host: boolean })[];
  total_players: number;
  needs: number;
  /** Players in this game the viewer has blocked. Non-empty: show "Are you sure? [name] is playing in this match." */
  blocked_player_names: string[];
  my_request_status: MyStatus;
  /** The game's group chat. Only useful to players in it. */
  conversation_id: string | null;
};

/** One game with everyone in it. Null if it doesn't exist or has been cancelled/played. */
export async function getGame(client: RpcClient, gameId: string): Promise<GameDetail | null> {
  const g = await call<Omit<GameDetail, "total_players" | "needs"> | null>(client, "game_detail", { p_game_id: gameId });
  if (!g) return null;
  const total = g.format === "singles" ? 2 : 4;
  return { ...g, total_players: total, needs: Math.max(0, total - g.players.length - g.guest_count) };
}

export type CrewDetail = {
  id: string;
  name: string;
  format: PlayFormat;
  play_style: PlayStyle;
  play_times: TimeSlot[];
  is_open: boolean;
  guest_count: number;
  court: CourtInfo;
  members: PlayerCard[];
  needs: number;
  blocked_player_names: string[];
  my_request_status: MyStatus;
  conversation_id: string | null;
};

export async function getCrew(client: RpcClient, crewId: string): Promise<CrewDetail | null> {
  const c = await call<Omit<CrewDetail, "needs"> | null>(client, "crew_detail", { p_crew_id: crewId });
  if (!c) return null;
  return { ...c, needs: Math.max(0, 4 - c.members.length - c.guest_count) };
}

export type PlayerProfile = PlayerCard & {
  courts: { id: string; name: string; is_home: boolean }[];
  hill_streaks: { court_id: string; court_name: string; streak: number }[];
  my_request_status: MyStatus;
};

/** A player's full profile. Null if they don't exist or either of you has blocked the other. */
export async function getPlayerProfile(client: RpcClient, playerId: string): Promise<PlayerProfile | null> {
  return call<PlayerProfile | null>(client, "player_profile", { p_player_id: playerId });
}

export type IncomingRequest = {
  id: string;
  target_kind: "game" | "crew" | "player";
  game_id: string | null;
  crew_id: string | null;
  created_at: string;
  requester: PlayerCard;
};

export type OutgoingRequest = {
  id: string;
  target_kind: "game" | "crew" | "player";
  game_id: string | null;
  crew_id: string | null;
  player_id: string | null;
  status: RequestStatus;
  created_at: string;
};

/** Requests waiting for your answer, and ones you've sent. */
export async function getMyRequests(
  client: RpcClient,
): Promise<{ incoming: IncomingRequest[]; outgoing: OutgoingRequest[] }> {
  return call(client, "my_requests");
}

// ---------------------------------------------------------------------------
// Writes. Each throws a BinkError with a player-friendly message if refused.
// ---------------------------------------------------------------------------

export type NewGame = {
  courtId: string;
  startsAt: Date | string;
  format: PlayFormat;
  targetLevel?: number | null;
  playStyle?: PlayStyle | null;
  note?: string | null;
  /** People already playing who aren't on Bink. */
  guestCount?: number;
};

/** Post a game. You're its host and first player. Returns the game id. */
export async function createGame(client: RpcClient, game: NewGame): Promise<string> {
  return call(client, "create_game", {
    p_court_id: game.courtId,
    p_starts_at: typeof game.startsAt === "string" ? game.startsAt : game.startsAt.toISOString(),
    p_format: game.format,
    p_target_level: game.targetLevel ?? null,
    p_play_style: game.playStyle ?? null,
    p_note: game.note ?? null,
    p_guest_count: game.guestCount ?? 0,
  });
}

export const cancelGame = (client: RpcClient, gameId: string) =>
  call<boolean>(client, "cancel_game", { p_game_id: gameId });

export const leaveGame = (client: RpcClient, gameId: string) =>
  call<boolean>(client, "leave_game", { p_game_id: gameId });

export type NewCrew = {
  name: string;
  homeCourtId: string;
  format: PlayFormat;
  playStyle: PlayStyle;
  playTimes?: TimeSlot[];
  /** Regulars who aren't on Bink: 1 or 2, so the crew starts with 2 or 3. */
  guestCount: number;
};

/** Start a crew. You're its first Bink member. Returns the crew id. */
export async function createCrew(client: RpcClient, crew: NewCrew): Promise<string> {
  return call(client, "create_crew", {
    p_name: crew.name,
    p_home_court_id: crew.homeCourtId,
    p_format: crew.format,
    p_play_style: crew.playStyle,
    p_play_times: crew.playTimes ?? [],
    p_guest_count: crew.guestCount,
  });
}

/** Mark a crew as still looking (true) or full (false). */
export const setCrewOpen = (client: RpcClient, crewId: string, isOpen: boolean) =>
  call<boolean>(client, "set_crew_open", { p_crew_id: crewId, p_is_open: isOpen });

export const leaveCrew = (client: RpcClient, crewId: string) =>
  call<boolean>(client, "leave_crew", { p_crew_id: crewId });

/** Ask to join a game. Returns the request id. */
export const askToJoinGame = (client: RpcClient, gameId: string) =>
  call<string>(client, "request_to_join_game", { p_game_id: gameId });

/** Ask to join a crew. Returns the request id. */
export const askToJoinCrew = (client: RpcClient, crewId: string) =>
  call<string>(client, "request_to_join_crew", { p_crew_id: crewId });

/**
 * "Ask to play" on a player's profile. Returns the request id. If they had
 * already asked you, this answers theirs: both requests are accepted and the
 * one-to-one chat opens (check the status in getMyRequests).
 */
export const askToPlay = (client: RpcClient, playerId: string) =>
  call<string>(client, "request_to_play", { p_player_id: playerId });

/** Withdraw a request you sent that hasn't been answered. */
export const cancelRequest = (client: RpcClient, requestId: string) =>
  call<boolean>(client, "cancel_request", { p_request_id: requestId });

/**
 * Accept or decline a request. Accepting returns the chat to open: the game's
 * or crew's group chat, or a new one-to-one chat for a play request.
 */
export const respondToRequest = (client: RpcClient, requestId: string, accept: boolean) =>
  call<string | null>(client, "respond_to_request", { p_request_id: requestId, p_accept: accept });

export const blockPlayer = (client: RpcClient, playerId: string) =>
  call<boolean>(client, "block_player", { p_player_id: playerId });

export const unblockPlayer = (client: RpcClient, playerId: string) =>
  call<boolean>(client, "unblock_player", { p_player_id: playerId });

/** Call when a signed-in player opens the app; feeds the activity score. */
export const markActive = (client: RpcClient) => call<boolean>(client, "touch_last_active");
