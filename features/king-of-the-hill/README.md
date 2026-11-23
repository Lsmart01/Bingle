# King of the hill

Shows players who are on winning streaks and lets others challenge them.

**Start here:** `components/hill-screen.tsx` is what `/hill` shows. It's a placeholder for now; replace it with the real screen.

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
