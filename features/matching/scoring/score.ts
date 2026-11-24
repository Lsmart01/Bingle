// How well one player, crew or game fits the viewer, from 0 to 100 (+5 bonus).
// Pure functions: no database, no clock (callers pass in days and times), so
// they're easy to test. See settings.ts for every number.
import type { Day, DayPart, Gender, PlayFormat, PlayStyle, TimeSlot } from "@/shared/models";
import { MATCH_SETTINGS, type MatchSettings } from "./settings";

/** The viewer, reduced to what scoring needs. */
export type ScoringViewer = {
  skill: number;
  style: PlayStyle;
  formats: PlayFormat[];
  playTimes: TimeSlot[];
  homeCourtId: string | null;
  /** Every court they play at, including their home court. */
  courtIds: string[];
  area: string | null;
  prefAgeMin: number | null;
  prefAgeMax: number | null;
  prefGender: Gender[] | null;
};

/** A player, crew or game, reduced to what scoring needs. */
export type ScoringSubject = {
  skill: number;
  /** null: not set (a game with no style). Scores half. */
  style: PlayStyle | null;
  formats: PlayFormat[];
  /** Usual slots for players and crews. Empty means not set, which scores half. */
  playTimes: TimeSlot[];
  /** For games: when it is. Replaces playTimes with "time fit". */
  gameTime?: { day: Day; part: DayPart };
  homeCourtId: string | null;
  courtIds: string[];
  area: string | null;
  /** Days since last active. null for games, which always count as active. */
  daysInactive: number | null;
  /** null when unknown. Scores half. */
  age: number | null;
  /** Gender of each Bink person involved (one for a player, all members for a crew or game). */
  genders: (Gender | null)[];
  /** Has a current hill streak at one of the viewer's courts (only counts for competitive viewers). */
  hasHillStreakAtViewerCourt: boolean;
};

export type Dealbreaker = "skill_gap" | "no_shared_format" | "inactive" | "gender";

/**
 * How the subject fits the viewer's gender preference.
 * "unknown": someone chose "prefer not to say" or left it blank. Never hidden,
 * never a dealbreaker, but ranked below people who match.
 */
export type GenderFit = "no_preference" | "match" | "unknown" | "mismatch";

export type ScoreBreakdown = {
  skill: number;
  time: number;
  place: number;
  style: number;
  format: number;
  activity: number;
  age: number;
  hill: number;
  total: number;
  dealbreakers: Dealbreaker[];
  genderFit: GenderFit;
};

const STYLE_ORDER: PlayStyle[] = ["fun", "social", "competitive"];

export function scoreSubject(
  viewer: ScoringViewer,
  subject: ScoringSubject,
  settings: MatchSettings = MATCH_SETTINGS,
): ScoreBreakdown {
  const gap = round(Math.abs(viewer.skill - subject.skill));
  const skill = skillPoints(gap, settings);
  const time = subject.gameTime
    ? gameTimePoints(viewer.playTimes, subject.gameTime, settings)
    : playTimePoints(viewer.playTimes, subject.playTimes, settings);
  const place = placePoints(viewer, subject, settings);
  const style = stylePoints(viewer.style, subject.style, settings);
  const format = formatPoints(viewer.formats, subject.formats, settings);
  const activity = activityPoints(subject.daysInactive, settings);
  const age = agePoints(viewer, subject.age, settings);
  const hill = viewer.style === "competitive" && subject.hasHillStreakAtViewerCourt ? settings.hillBonus : 0;
  const genderFit = genderFitFor(viewer.prefGender, subject.genders);

  const dealbreakers: Dealbreaker[] = [];
  if (gap > settings.skill.dealbreakerGap) dealbreakers.push("skill_gap");
  if (!viewer.formats.some((f) => subject.formats.includes(f))) dealbreakers.push("no_shared_format");
  if (subject.daysInactive !== null && subject.daysInactive > settings.activity.dealbreakerDays) {
    dealbreakers.push("inactive");
  }
  if (genderFit === "mismatch") dealbreakers.push("gender");

  return {
    skill, time, place, style, format, activity, age, hill,
    total: round(skill + time + place + style + format + activity + age + hill),
    dealbreakers,
    genderFit,
  };
}

export function skillPoints(gap: number, settings: MatchSettings = MATCH_SETTINGS): number {
  for (const [maxGap, points] of settings.skill.steps) {
    if (gap <= maxGap) return points;
  }
  return 0;
}

/** max × (shared slots ÷ viewer's slots). Either side not set: half. */
export function playTimePoints(
  viewerSlots: TimeSlot[],
  subjectSlots: TimeSlot[],
  settings: MatchSettings = MATCH_SETTINGS,
): number {
  const { max } = settings.playTimes;
  if (viewerSlots.length === 0 || subjectSlots.length === 0) return max / 2;
  const shared = viewerSlots.filter((s) => subjectSlots.includes(s)).length;
  return round((max * shared) / viewerSlots.length);
}

/** Games: on one of the viewer's slots, max; on one of their days at another time, partial; else 0. */
export function gameTimePoints(
  viewerSlots: TimeSlot[],
  when: { day: Day; part: DayPart },
  settings: MatchSettings = MATCH_SETTINGS,
): number {
  if (viewerSlots.length === 0) return settings.playTimes.max / 2;
  if (viewerSlots.includes(`${when.day}_${when.part}`)) return settings.playTimes.max;
  if (viewerSlots.some((s) => s.startsWith(`${when.day}_`))) return settings.playTimes.gameSameDayOtherTime;
  return 0;
}

export function placePoints(
  viewer: Pick<ScoringViewer, "homeCourtId" | "courtIds" | "area">,
  subject: Pick<ScoringSubject, "homeCourtId" | "courtIds" | "area">,
  settings: MatchSettings = MATCH_SETTINGS,
): number {
  const p = settings.place;
  const viewerKnown = viewer.courtIds.length > 0 || viewer.area !== null;
  const subjectKnown = subject.courtIds.length > 0 || subject.area !== null;
  if (!viewerKnown || !subjectKnown) return p.max / 2;
  if (viewer.homeCourtId && viewer.homeCourtId === subject.homeCourtId) return p.sameHomeCourt;
  if (subject.courtIds.some((c) => viewer.courtIds.includes(c))) return p.sharedCourt;
  if (viewer.area && viewer.area === subject.area) return p.sameArea;
  return 0;
}

export function stylePoints(
  viewer: PlayStyle,
  subject: PlayStyle | null,
  settings: MatchSettings = MATCH_SETTINGS,
): number {
  if (subject === null) return settings.style.max / 2;
  const steps = Math.abs(STYLE_ORDER.indexOf(viewer) - STYLE_ORDER.indexOf(subject));
  if (steps === 0) return settings.style.same;
  if (steps === 1) return settings.style.oneStep;
  return 0;
}

/** Plays all of the viewer's formats: full; some: partial; none: 0. */
export function formatPoints(
  viewer: PlayFormat[],
  subject: PlayFormat[],
  settings: MatchSettings = MATCH_SETTINGS,
): number {
  const shared = viewer.filter((f) => subject.includes(f)).length;
  if (shared === 0) return 0;
  return shared === viewer.length ? settings.format.all : settings.format.some;
}

export function activityPoints(daysInactive: number | null, settings: MatchSettings = MATCH_SETTINGS): number {
  if (daysInactive === null) return settings.activity.max;
  for (const [withinDays, points] of settings.activity.steps) {
    if (daysInactive <= withinDays) return points;
  }
  return 0;
}

export function agePoints(
  viewer: Pick<ScoringViewer, "prefAgeMin" | "prefAgeMax">,
  age: number | null,
  settings: MatchSettings = MATCH_SETTINGS,
): number {
  const { max } = settings.age;
  if (viewer.prefAgeMin === null && viewer.prefAgeMax === null) return max;
  if (age === null) return max / 2;
  if (viewer.prefAgeMin !== null && age < viewer.prefAgeMin) return 0;
  if (viewer.prefAgeMax !== null && age > viewer.prefAgeMax) return 0;
  return max;
}

/** A group matches only if every member does. Any mismatch wins over unknown. */
export function genderFitFor(pref: Gender[] | null, genders: (Gender | null)[]): GenderFit {
  const wanted = (pref ?? []).filter((g) => g !== "prefer_not_to_say");
  if (wanted.length === 0) return "no_preference";
  let unknown = false;
  for (const g of genders) {
    if (g === null || g === "prefer_not_to_say") unknown = true;
    else if (!wanted.includes(g)) return "mismatch";
  }
  return unknown || genders.length === 0 ? "unknown" : "match";
}

/** Rounds to 3 decimal places so float noise (3.5 − 3.25) doesn't change a step. */
function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
