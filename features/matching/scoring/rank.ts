// Builds the "for you" directory from what for_you_inputs() returns:
//   1. Games needing players
//   2. Best matches for you (players and crews scoring 60+, no dealbreaker)
//   3. Everyone else in Victoria
//   4. Not looking right now (players with "open to play" off)
// Scores are used for ordering only; toForYou() strips them before anything
// reaches a screen.
import type {
  CourtSummary, Crew, Game, HillStreak, PlayerCard, PlayFormat, PlayStyle, TimeSlot, ViewerProfile,
} from "@/shared/models";
import {
  activityPoints, scoreSubject, type GenderFit, type ScoreBreakdown, type ScoringSubject, type ScoringViewer,
} from "./score";
import { MATCH_SETTINGS, type MatchSettings } from "./settings";
import { daysBetween, localDate, localSlot } from "./time";

/** Exactly what public.for_you_inputs() returns. */
export type ForYouInputs = {
  viewer: ViewerProfile | null;
  /** Cards for everyone in the directory plus everyone in an open crew or upcoming game. */
  players: PlayerCard[];
  /** Who may appear as a player card: everyone except the viewer and blocks either way. */
  directory_player_ids: string[];
  crews: Crew[];
  games: Game[];
  courts: CourtSummary[];
  hill_streaks: HillStreak[];
  /** Players the viewer has blocked. */
  blocked_ids: string[];
};

export type PersonBrief = { id: string; name: string; photo_url: string; age: number };

export type PlayerEntry = {
  kind: "player";
  id: string;
  name: string;
  age: number;
  photo_url: string;
  bio: string;
  skill: number;
  has_dupr: boolean;
  play_style: PlayStyle;
  formats: PlayFormat[];
  play_times: TimeSlot[];
  area: string | null;
  home_court: CourtSummary | null;
  open_to_play: boolean;
  /** Their longest current hill streak, if they hold a hill. */
  hill_streak: number | null;
};

export type CrewEntry = {
  kind: "crew";
  id: string;
  name: string;
  members: PersonBrief[];
  guest_count: number;
  needs: number;
  /** Average of the Bink members' skill, to one decimal. */
  skill: number | null;
  play_style: PlayStyle;
  format: PlayFormat;
  play_times: TimeSlot[];
  court: CourtSummary | null;
  /** Someone the viewer blocked is in it: warn before asking to join. */
  has_blocked_player: boolean;
};

export type GameEntry = {
  kind: "game";
  id: string;
  court: CourtSummary | null;
  starts_at: string;
  format: PlayFormat;
  target_level: number | null;
  play_style: PlayStyle | null;
  note: string | null;
  players: PersonBrief[];
  guest_count: number;
  total_players: number;
  needs: number;
  has_blocked_player: boolean;
};

export type DirectoryEntry = PlayerEntry | CrewEntry;

export type ForYou = {
  games: GameEntry[];
  best_matches: DirectoryEntry[];
  everyone_else: DirectoryEntry[];
  not_looking: PlayerEntry[];
};

/** An entry with the numbers behind its position. Server-side and tests only. */
export type Ranked<T> = { entry: T; score: number; breakdown: ScoreBreakdown | null };

export type RankedForYou = {
  games: Ranked<GameEntry>[];
  best_matches: Ranked<DirectoryEntry>[];
  everyone_else: Ranked<DirectoryEntry>[];
  not_looking: Ranked<PlayerEntry>[];
};

export function rankForYou(
  inputs: ForYouInputs,
  options: { now?: Date; settings?: MatchSettings } = {},
): RankedForYou {
  const settings = options.settings ?? MATCH_SETTINGS;
  const now = options.now ?? new Date();
  const today = localDate(now, settings);
  const seed = `${inputs.viewer?.id ?? "guest"}:${today}`;

  const courts = new Map(inputs.courts.map((c) => [c.id, c]));
  const players = new Map(inputs.players.map((p) => [p.id, p]));
  const blocked = new Set(inputs.blocked_ids);
  const viewerId = inputs.viewer?.id ?? null;
  const viewer = inputs.viewer ? toScoringViewer(inputs.viewer, courts) : null;

  const streaksByPlayer = new Map<string, HillStreak[]>();
  for (const s of inputs.hill_streaks) {
    if (s.streak < 1) continue;
    streaksByPlayer.set(s.player_id, [...(streaksByPlayer.get(s.player_id) ?? []), s]);
  }
  const hasStreakAtViewerCourt = (ids: string[]) =>
    !!viewer && ids.some((id) => (streaksByPlayer.get(id) ?? []).some((s) => viewer.courtIds.includes(s.court_id)));
  const daysInactive = (p: PlayerCard) => Math.max(0, daysBetween(p.last_active_on, today));
  const people = (ids: string[]) => ids.map((id) => players.get(id)).filter((p): p is PlayerCard => !!p);

  // Without a signed-in profile there's nothing to match against, so order
  // by how recently people were active.
  const score = (subject: ScoringSubject): Ranked<null> =>
    viewer
      ? (() => {
          const breakdown = scoreSubject(viewer, subject, settings);
          return { entry: null, score: breakdown.total, breakdown };
        })()
      : { entry: null, score: activityPoints(subject.daysInactive, settings), breakdown: null };

  // ---- Players ----
  const rankedPlayers: Ranked<PlayerEntry>[] = [];
  for (const id of inputs.directory_player_ids) {
    const p = players.get(id);
    if (!p || id === viewerId) continue;
    const home = p.home_court_id ? courts.get(p.home_court_id) ?? null : null;
    const r = score({
      skill: p.match_skill,
      style: p.play_style,
      formats: p.formats,
      playTimes: p.play_times,
      homeCourtId: p.home_court_id,
      courtIds: p.court_ids,
      area: p.area ?? home?.area ?? null,
      daysInactive: daysInactive(p),
      age: p.age,
      genders: [p.gender],
      hasHillStreakAtViewerCourt: hasStreakAtViewerCourt([p.id]),
    });
    const streaks = streaksByPlayer.get(p.id) ?? [];
    rankedPlayers.push({
      ...r,
      entry: {
        kind: "player",
        id: p.id,
        name: p.name,
        age: p.age,
        photo_url: p.photo_url,
        bio: p.bio,
        skill: p.match_skill,
        has_dupr: p.dupr !== null,
        play_style: p.play_style,
        formats: p.formats,
        play_times: p.play_times,
        area: p.area ?? home?.area ?? null,
        home_court: home,
        open_to_play: p.open_to_play,
        hill_streak: streaks.length ? Math.max(...streaks.map((s) => s.streak)) : null,
      },
    });
  }

  // ---- Crews ----
  const rankedCrews: Ranked<CrewEntry>[] = [];
  for (const c of inputs.crews) {
    if (viewerId && c.member_ids.includes(viewerId)) continue;
    const needs = settings.crewSize - c.member_ids.length - c.guest_count;
    if (!c.is_open || needs <= 0) continue;
    const members = people(c.member_ids);
    if (members.length === 0) continue;
    const court = courts.get(c.home_court_id) ?? null;
    const r = score({
      skill: average(members.map((m) => m.match_skill)),
      style: c.play_style,
      formats: [c.format],
      playTimes: c.play_times,
      homeCourtId: c.home_court_id,
      courtIds: [c.home_court_id],
      area: court?.area ?? null,
      daysInactive: Math.min(...members.map(daysInactive)),
      age: average(members.map((m) => m.age)),
      genders: members.map((m) => m.gender),
      hasHillStreakAtViewerCourt: hasStreakAtViewerCourt(c.member_ids),
    });
    rankedCrews.push({
      ...r,
      entry: {
        kind: "crew",
        id: c.id,
        name: c.name,
        members: members.map(brief),
        guest_count: c.guest_count,
        needs,
        skill: Math.round(average(members.map((m) => m.match_skill)) * 10) / 10,
        play_style: c.play_style,
        format: c.format,
        play_times: c.play_times,
        court,
        has_blocked_player: c.member_ids.some((id) => blocked.has(id)),
      },
    });
  }

  // ---- Games ----
  const windowEnd = now.getTime() + settings.gameWindowDays * 86_400_000;
  const rankedGames: Ranked<GameEntry>[] = [];
  for (const g of inputs.games) {
    const startsAt = new Date(g.starts_at);
    if (startsAt.getTime() <= now.getTime() || startsAt.getTime() > windowEnd) continue;
    if (viewerId && g.player_ids.includes(viewerId)) continue;
    const total = g.format === "singles" ? 2 : 4;
    const needs = total - g.player_ids.length - g.guest_count;
    if (needs <= 0) continue;
    const inGame = people(g.player_ids);
    const court = courts.get(g.court_id) ?? null;
    const r = score({
      skill: g.target_level ?? (inGame.length ? average(inGame.map((m) => m.match_skill)) : viewer?.skill ?? 3),
      style: g.play_style,
      formats: [g.format],
      playTimes: [],
      gameTime: localSlot(startsAt, settings),
      homeCourtId: g.court_id,
      courtIds: [g.court_id],
      area: court?.area ?? null,
      daysInactive: null,
      age: inGame.length ? average(inGame.map((m) => m.age)) : null,
      genders: inGame.map((m) => m.gender),
      hasHillStreakAtViewerCourt: hasStreakAtViewerCourt(g.player_ids),
    });
    rankedGames.push({
      ...r,
      entry: {
        kind: "game",
        id: g.id,
        court,
        starts_at: g.starts_at,
        format: g.format,
        target_level: g.target_level,
        play_style: g.play_style,
        note: g.note,
        players: inGame.map(brief),
        guest_count: g.guest_count,
        total_players: total,
        needs,
        has_blocked_player: g.player_ids.some((id) => blocked.has(id)),
      },
    });
  }

  // ---- Sections ----
  const keep = (r: Ranked<unknown>) => !settings.strictMode || !r.breakdown || r.breakdown.dealbreakers.length === 0;
  const isBest = (r: Ranked<unknown>) =>
    !!r.breakdown &&
    r.score >= settings.bestMatchMinScore &&
    r.breakdown.dealbreakers.length === 0 &&
    (r.breakdown.genderFit === "no_preference" || r.breakdown.genderFit === "match");

  const lookingPlayers = rankedPlayers.filter((r) => r.entry.open_to_play);
  const directory: Ranked<DirectoryEntry>[] = [...lookingPlayers, ...rankedCrews].filter(keep);

  const games = viewer
    ? shuffleTies(
        rankedGames.filter(keep),
        (r) => (r.breakdown!.dealbreakers.length ? 10 : 0) + genderGroup(r.breakdown!.genderFit),
        seed,
        settings,
      )
    : [...rankedGames].sort((a, b) => a.entry.starts_at.localeCompare(b.entry.starts_at));

  return {
    games,
    best_matches: shuffleTies(directory.filter(isBest), () => 0, seed, settings),
    everyone_else: shuffleTies(
      directory.filter((r) => !isBest(r)),
      (r) => (r.breakdown ? genderGroup(r.breakdown.genderFit) : 0),
      seed,
      settings,
    ),
    not_looking: shuffleTies(
      rankedPlayers.filter((r) => !r.entry.open_to_play).filter(keep),
      () => 0,
      seed,
      settings,
    ),
  };
}

/** Drop the scores: players see the order, never the numbers. */
export function toForYou(ranked: RankedForYou): ForYou {
  const entries = <T>(list: Ranked<T>[]) => list.map((r) => r.entry);
  return {
    games: entries(ranked.games),
    best_matches: entries(ranked.best_matches),
    everyone_else: entries(ranked.everyone_else),
    not_looking: entries(ranked.not_looking),
  };
}

/**
 * People who match a gender preference come first, then "prefer not to say",
 * then (launch mode only) people outside it.
 */
function genderGroup(fit: GenderFit): number {
  return fit === "unknown" ? 1 : fit === "mismatch" ? 2 : 0;
}

/**
 * Sort by group, then score (best first). Then, within a group, entries
 * within `shuffleWithinPoints` of the top of their run are shuffled, the same
 * way all day for a given viewer, so the same few people don't always lead.
 */
export function shuffleTies<T extends { id: string }>(
  items: Ranked<T>[],
  group: (r: Ranked<T>) => number,
  seed: string,
  settings: MatchSettings = MATCH_SETTINGS,
): Ranked<T>[] {
  const sorted = [...items].sort(
    (a, b) => group(a) - group(b) || b.score - a.score || a.entry.id.localeCompare(b.entry.id),
  );
  const out: Ranked<T>[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (
      j < sorted.length &&
      group(sorted[j]) === group(sorted[i]) &&
      sorted[i].score - sorted[j].score <= settings.shuffleWithinPoints
    ) {
      j++;
    }
    out.push(...sorted.slice(i, j).sort((a, b) => hash(seed + a.entry.id) - hash(seed + b.entry.id)));
    i = j;
  }
  return out;
}

function toScoringViewer(v: ViewerProfile, courts: Map<string, CourtSummary>): ScoringViewer {
  const home = v.home_court_id ? courts.get(v.home_court_id) : undefined;
  return {
    skill: v.match_skill,
    style: v.play_style,
    formats: v.formats,
    playTimes: v.play_times,
    homeCourtId: v.home_court_id,
    courtIds: v.court_ids,
    area: v.area ?? home?.area ?? null,
    prefAgeMin: v.pref_age_min,
    prefAgeMax: v.pref_age_max,
    prefGender: v.pref_gender,
  };
}

function brief(p: PlayerCard): PersonBrief {
  return { id: p.id, name: p.name, photo_url: p.photo_url, age: p.age };
}

function average(ns: number[]): number {
  return ns.reduce((a, b) => a + b, 0) / ns.length;
}

/** FNV-1a: a small, stable string hash for the daily shuffle. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
