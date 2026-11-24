# King of the hill

Shows players who are on winning streaks and lets others challenge them.

**Start here:** `components/hill-screen.tsx` is what `/hill` shows. It's a placeholder for now; replace it with the real screen.

**Backend (a starting point for Ben):** the `hill_matches` table and `hill_streaks` view are in `supabase/migrations/20261124120000_core.sql`, and `data.ts` has `getCourtHill()` and `confirmHillMatch()`. A result counts once both players confirm it. Matchmaking only relies on `hill_streaks` having `court_id`, `player_id` and `streak`, so the rest can be reshaped. Still to build: the founder's rule that an opponent who doesn't confirm in time counts as the loser.

## Starting scope

- Leaderboard of current win streaks
- Challenge a player who's on a streak
- Record match results so streaks update

## Depends on

- `profile/`: skill level, for fair challenges.
- `matching/` (possibly): suggest good challengers.

## To decide

- How results are confirmed: do both players have to confirm the score?
- One hill for everyone, or separate hills by skill level or area?
- What ends a streak besides a loss, such as not playing for a while?
