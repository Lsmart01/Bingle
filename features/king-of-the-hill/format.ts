// Display helpers. Dates show in Victoria's time zone.

const TZ = "America/Vancouver";

/** "Nov 24" */
export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: TZ });
}

/** "Oct 2026" */
export function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", year: "numeric", timeZone: TZ });
}

/** +5, −3, 0 */
export function signed(n: number) {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0";
}

export function formatLabel(format: "singles" | "doubles") {
  return format === "singles" ? "Singles" : "Doubles";
}

/** "Alex (sample)" or "Alex (sample) & Blair (sample)" */
export function joinNames(players: { name: string }[]) {
  return players.map((p) => p.name).join(" & ");
}
