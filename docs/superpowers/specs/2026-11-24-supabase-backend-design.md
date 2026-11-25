# Supabase backend foundation — design

Date: 2026-11-24 · Status: approved

## Why

Bink's matchmaking is moving to a court-first model. The live map shows only Victoria's pickleball courts. Tapping a court shows the players who call it home or play there often, and that court's king of the hill. A separate "Find players in Victoria" directory lists everyone, ranked like a "for you" feed. None of this has a backend yet. This work writes the backend foundation so it's ready when a Supabase project exists.

## Goals

- Database tables, access rules and seed data, written as Supabase migration files
- TypeScript data shapes that match the tables
- Read functions for the three things the app needs: all courts, one court's players and hill, and the Victoria directory
- Feature READMEs updated to match the court-first model

## Non-goals

- Running anything. There's no Supabase project, Docker or Node on this machine yet, so the code is written but not run.
- The "for you" ranking. It waits on the product questions about what a good match is. The directory uses a placeholder order, clearly marked as temporary.
- Map UI, sign-up and login screens, hosting.

## Anti-goals

- Changing anything the app does today. No page imports the new code, so the app builds and behaves as before.

## Approaches considered

| Option | Trade-off | Outcome |
|---|---|---|
| A. Local Supabase via Docker | Safe and reviewable, but needs Docker installed | Chosen at first, then switched to code-only because no tools are installed yet |
| B. Hosted Supabase now | Live right away, but no review step and no easy undo | Not chosen |
| C. Fake data in code | Something to see today, but the data layer gets thrown away | Considered, not chosen |
| **Code only, ready for Supabase** | Nothing can be tested until a project exists; expect small fixes on connection day | **Chosen** |

## Design

**Tables** (`supabase/migrations/`):
- `players`: one row per signed-in user (`id` references `auth.users`), with name, photo URL, self-rated skill (2.0 to 5.0), optional DUPR, play style (`fun` / `social` / `competitive`), open to play, area of Victoria and usual play times
- `courts`: name, address, latitude and longitude, number of courts, indoor or outdoor
- `player_courts`: player ↔ court, with `is_home` (at most one home court per player)
- `hill_matches`: per court, winner, loser, score, played at, and a confirmation from each player. A result counts once both players confirm. Win streaks are worked out from confirmed results, in a view.

**Access rules (RLS):** signed-in users can read players, courts, player_courts and confirmed matches. Players can only edit their own profile and court links. Either player in a match can record it, and each can only set their own confirmation.

**Seed data** (`supabase/seed.sql`): real Victoria-area public pickleball courts (checked online) plus about 30 made-up players, for local development only.

**Code:**
- `shared/models/`: Player, Court, PlayerCourt, HillMatch, HillStreak
- `shared/supabase/`: client creation from environment variables
- `features/events-map/data.ts`: `getCourts()`, `getCourtDetail(courtId)`
- `features/king-of-the-hill/data.ts`: `getCourtHill(courtId)`
- `features/matching/data.ts`: `getVictoriaDirectory()`, sorted by a placeholder order
- `@supabase/supabase-js` added to `package.json`

## Calls made by Claude (changeable)

- Skill is self-rated from 2.0 to 5.0, with an optional DUPR rating.
- A hill result only counts once both players confirm it.

## Left to the builder

- Exact column types and index choices
- The placeholder directory order
- How streaks are calculated in SQL
