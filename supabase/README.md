# Supabase

Bink's database: tables, access rules and functions, as Supabase migrations.

| File | What's in it |
|---|---|
| `migrations/20261124120000_core.sql` | Courts, players, the courts each player uses, blocking, king of the hill |
| `migrations/20261124120100_crews_games_chat.sql` | Crews, games, requests (join a crew or game, or ask a player to play), chat, and every write function |
| `migrations/20261124120200_reads.sql` | The read functions the app calls (directory inputs, game, crew, profile, courts, requests, chat) |
| `seed.sql` | Local development data: the real Victoria courts (approximate coordinates) and 30 made-up players, 2 crews, 3 games |

The design is in `docs/superpowers/specs/2026-11-24-matchmaking-design.md` and `2026-11-24-supabase-backend-design.md`.

## How it fits together

- **Every read and write is a database function**, called with `supabase.rpc(...)`. The TypeScript wrappers are in `features/matching/data.ts`, `features/matching/chat.ts`, `features/events-map/data.ts` and `features/king-of-the-hill/data.ts`. Pass them a Supabase client signed in as the player.
- **The "for you" ranking runs in TypeScript** (`features/matching/scoring/`). The database function `for_you_inputs()` gathers what it needs in one call. All the weights are in `features/matching/scoring/settings.ts`.
- **Privacy.** Only you can read your own `players` row (birth date, match preferences). Everyone else sees `player_cards`, which shows age instead of birth date. `directory_players` is the same minus you and anyone blocked in either direction. Phone numbers and emails are never stored on profiles.
- **Signed-out visitors** can browse the directory, courts, crews and games. Asking to play or join, posting and chat need a sign-in.

Supabase's security advisor will flag `player_cards`, `directory_players` and `hill_streaks` as "security definer views". That's intentional: it's how age is shown while birth date stays hidden. All three are read-only for every role, and the tests check that.

## Testing (no Supabase or Docker needed)

```
npm test
```

This runs the real migrations in PGlite, an in-memory Postgres. A small stand-in for Supabase's `auth` schema and roles is in `tests/db/supabase-stubs.sql`. The tests sign in as different players and check the access rules, every write function, the chat rules, blocking, and the directory built from the seed data. GitHub runs them on every push.

## Connecting a real Supabase project

1. Create a project at supabase.com. Choose the Canada (Central) region if it's offered.
2. Install the Supabase CLI. Then, from this folder's parent, run `supabase init` (only once, to create `supabase/config.toml`) and `supabase link --project-ref <your-project-ref>`.
3. Run `supabase db push` to apply the migrations. Don't push `seed.sql` to the live project.
4. In the dashboard under **Authentication → Providers**, turn on email sign-in.
5. Create `.env.local` in the project root with the values from **Project Settings → API**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon / publishable key>
   ```

   Never put the `service_role` key in a `NEXT_PUBLIC_` variable.
6. Add the same two variables to the hosting provider (for example, Vercel).

`createBinkClient()` in `shared/supabase/client.ts` reads these variables. Server-side sessions for signed-in players (cookies via `@supabase/ssr`) come with the sign-in screens.

For local development with the full Supabase stack (needs Docker), run `supabase start`, then `supabase db reset`, which applies the migrations and the seed. Seed players sign in as `player-01@bink.test` to `player-30@bink.test` with a magic link from the local inbox; they have no password.

## Before launch

- Geocode the courts. The seed coordinates are approximate, because the court research found no source for them.
- Strict mode is off (`strictMode` in `features/matching/scoring/settings.ts`). Turn it on once a typical player has 30+ people scoring 60 or more.
