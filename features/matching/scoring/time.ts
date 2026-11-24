// Dates in Victoria's time zone, so "today", game days and evenings are local
// no matter where the code runs (Vercel servers run on UTC).
import type { Day, DayPart } from "@/shared/models";
import { MATCH_SETTINGS, type MatchSettings } from "./settings";

const WEEKDAYS: Record<string, Day> = {
  Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun",
};

function parts(date: Date, timeZone: string) {
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)) {
    out[p.type] = p.value;
  }
  return out;
}

/** The local calendar date as YYYY-MM-DD. */
export function localDate(date: Date, settings: MatchSettings = MATCH_SETTINGS): string {
  const p = parts(date, settings.timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

/** The local day of the week and part of day (morning, afternoon, evening). */
export function localSlot(date: Date, settings: MatchSettings = MATCH_SETTINGS): { day: Day; part: DayPart } {
  const p = parts(date, settings.timeZone);
  const hour = Number(p.hour);
  const part: DayPart =
    hour >= settings.eveningStartsAt ? "evening" : hour >= settings.afternoonStartsAt ? "afternoon" : "morning";
  return { day: WEEKDAYS[p.weekday], part };
}

/** Whole days from one YYYY-MM-DD date to another. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}
