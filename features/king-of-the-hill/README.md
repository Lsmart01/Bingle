# King of the hill

Shows players who are on winning streaks and lets others challenge them.

**Start here:** `components/hill-screen.tsx` is what `/hill` shows. It's a placeholder for now; replace it with the real screen.

**Backend (a starting point for Ben):** the `hill_matches` and `hill_match_players` tables and the `hill_streaks` view are in `supabase/migrations/20261124120000_core.sql`. `data.ts` has `getCourtHill()`, `recordHillMatch()`, `confirmHillMatch()`, `disputeHillMatch()` and `getMyHillResults()`. Results are singles (1 v 1) or doubles (2 v 2). A result counts once someone on the other side confirms it, or automatically after 24 hours if they don't dispute it. The window is `private.hill_confirm_window()`. Matchmaking only relies on `hill_streaks` having `court_id`, `player_id` and `streak`, so the rest can be reshaped.

## Starting scope

- Leaderboard of current win streaks
- Challenge a player who's on a streak
- Record match results so streaks update

## Depends on

- `profile/`: skill level, for fair challenges.
- `matching/` (possibly): suggest good challengers.

## To decide

- Separate singles and doubles hills at the same court? (Today there's one hill per court.)
- One hill for everyone, or separate hills by skill level or area?
- What ends a streak besides a loss, such as not playing for a while?
