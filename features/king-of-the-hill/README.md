# Champion of the Court

Every court has its own leaderboard. Win the most games at a court in the last 30 days and you're Champion of that court (King or Queen).

**Start here:** `components/hill-screen.tsx` is what `/hill` shows. Logging a game is `/hill/log`.

**Supabase backend (from the shared matchmaking work):** the `hill_matches` table and `hill_streaks` view are in `supabase/migrations/20261124120000_core.sql`, and the bottom of `data.ts` has `getCourtHill()` and `confirmHillMatch()`. Matchmaking only relies on `hill_streaks` having `court_id`, `player_id` and `streak`, so the rest can be reshaped. Version 1 below still runs on the local file and doesn't use them yet.

## Version 1

- **Court leaderboards:** one per court, with a Singles / Doubles switch. Ranked by wins from confirmed games in the last 30 days; point difference breaks ties. If someone is exactly level with the King, the King stays first.
- **Log a game:** court, singles or doubles, partner, opponent(s), score, Win or Loss. Scores go to 11, win by 2 (so 11–9 and 12–10 are fine, 11–10 and 13–10 aren't).
- **Confirm or dispute:** a logged game shows as "Waiting for confirmation" until a player on the other side confirms it. Only confirmed games count. Disputed games don't.
- **The crown:** first place at a court gets a 👑 on their photo and a "King of [court]" badge. In doubles, both partners get it. Needs at least one win.
- **Crown history:** past crowns stay on the profile, e.g. "King of Fernwood, Oct 2026". A crown also ends if the King's wins drop out of the 30-day window.
- **Streak flame:** 🔥 next to a name after 3+ confirmed wins in a row (any court).
- **Court Regular:** most confirmed games at a court in the last 30 days, singles and doubles together. If players are level, they all get it.

Not in version 1: skill-level boards, Elo or other ratings, head-to-head stats, partner stats, seasons, push notifications.

## Files

| File | What it does |
|---|---|
| `logic.ts` | The rules: score check, leaderboard, crowns, streaks, Court Regular. No database. Tested in `logic.test.ts` (`npm test`). |
| `data.ts` | Reads and writes: board view, profile view, log a game, confirm or dispute. |
| `store.ts` | Where the data lives for now: `.data/bink-local.json` (git-ignored). |
| `actions.ts` | Server actions the forms call. |
| `types.ts` | Player, Court, Game, Crown. Same shape as the Supabase tables. |
| `components/` | The board, pending games, and the Log a game form. |

## Testing it

There's no sign-in yet, so the app header has a **"Testing as"** menu (`shared/auth/`). Log a game as one sample player, switch to their opponent, and confirm it.

The sample players and courts are all labelled "(sample)" and flagged `isSample`. No games are seeded, so every number on a board comes from games you log. To start over, stop the dev server and delete `.data/bink-local.json`.

## Moving to Supabase

Version 1's own database file was removed when the shared Supabase schema was merged in, because both created `players`, `courts` and `games` tables. The plan:

1. Point version 1 at the shared schema's `hill_matches` and `hill_streaks`, adding what it lacks (doubles partners, crown history).
2. Replace `readDb` / `updateDb` in `data.ts` with Supabase calls. Nothing above `data.ts` changes.
3. Replace `getViewerId()` in `shared/auth/test-player.ts` with the signed-in user, and remove the "Testing as" menu from `app/(app)/layout.tsx`.
4. Crown changes run when a game is confirmed and on every board or profile view. In Supabase, move that into a database function, plus a daily job for crowns that expire through the 30-day window.
