// The shape of Bink's data, matching supabase/migrations/. Field names are
// the database's (snake_case) because these are what the functions return.

export type PlayStyle = "fun" | "social" | "competitive";
export type Gender = "woman" | "man" | "non_binary" | "prefer_not_to_say";
export type PlayFormat = "singles" | "doubles" | "mixed";
export type RequestStatus = "pending" | "accepted" | "declined";

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export const DAY_PARTS = ["morning", "afternoon", "evening"] as const;
export type Day = (typeof DAYS)[number];
export type DayPart = (typeof DAY_PARTS)[number];
/** A day plus part of day, such as "thu_evening". */
export type TimeSlot = `${Day}_${DayPart}`;

/** Everything other players can see about a player. Never includes birth date. */
export type PlayerCard = {
  id: string;
  name: string;
  photo_url: string;
  bio: string;
  age: number;
  gender: Gender | null;
  skill: number;
  dupr: number | null;
  /** DUPR if they have one, otherwise their self-rating. */
  match_skill: number;
  play_style: PlayStyle;
  formats: PlayFormat[];
  play_times: TimeSlot[];
  open_to_play: boolean;
  area: string | null;
  /** The day (Victoria time) they last opened Bink, as YYYY-MM-DD. */
  last_active_on: string;
  home_court_id: string | null;
  court_ids: string[];
};

/** The signed-in player, including their private match preferences. */
export type ViewerProfile = PlayerCard & {
  pref_age_min: number | null;
  pref_age_max: number | null;
  pref_gender: Gender[] | null;
};

export type CourtSummary = { id: string; name: string; area: string };

export type Court = CourtSummary & {
  slug: string;
  address: string | null;
  municipality: string;
  latitude: number;
  longitude: number;
  court_count: number | null;
  is_indoor: boolean;
};

export type Crew = {
  id: string;
  name: string;
  home_court_id: string;
  format: PlayFormat;
  play_style: PlayStyle;
  play_times: TimeSlot[];
  is_open: boolean;
  /** Regulars who aren't on Bink. */
  guest_count: number;
  member_ids: string[];
};

export type Game = {
  id: string;
  court_id: string;
  starts_at: string;
  format: PlayFormat;
  target_level: number | null;
  play_style: PlayStyle | null;
  note: string | null;
  host_id: string;
  /** People already playing who aren't on Bink. */
  guest_count: number;
  player_ids: string[];
};

export type HillStreak = { court_id: string; player_id: string; streak: number };
