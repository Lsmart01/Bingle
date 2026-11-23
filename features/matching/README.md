# Matchmaking

Takes player profiles and finds players who are a good fit, based on similar skill level, the same play style, nearby location and being open to play.

**Start here:** `components/matchmaking-screen.tsx` is what `/players` shows. It's a placeholder for now; replace it with the real screen.

## Starting scope

- Matching matrix: score how well two players fit, using profile fields
- Browse players like you, with filters for level, play style and so on
- See who is open to play and reach out to them

## Depends on

- `profile/`: every input to matching comes from profile fields.

## To decide

- Which fields matter most in the score, and how much weight each one gets
- How a player reaches out: a message, a game request, or both
