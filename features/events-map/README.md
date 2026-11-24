# Live map

A map of local pickleball events, such as tournaments, drop-ins, clinics and social nights.

**Start here:** `components/live-map-screen.tsx` is what `/events` shows. It's a placeholder for now; replace it with the real screen.

**Backend (built):** `data.ts` has `getCourts()` (every court, with its count of open games) and `getCourtDetail(courtId)` (who calls the court home or plays there, its king of the hill, and its open games). Bink's own events, shown with confetti, still need their own data.

## Starting scope

- Map with pins for upcoming events near the player
- Event details: what it is, where, when, skill level and host
- List view of the same events, for players who'd rather scroll than pan a map

## To decide

- Who can host events: any player, clubs and venues only, or admins?
- Which map provider to use (Google Maps, Mapbox, etc.)
