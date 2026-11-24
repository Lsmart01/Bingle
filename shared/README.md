# Shared

Code and settings that both the website and the app use. Only put something here when both sides need it.

- `auth/`: sign-in and session handling (empty until Supabase is connected). Players log in on the website, and the app uses this to know who's signed in.
- `styles/tokens.css`: the Bink colours, with light and dark versions. The website uses them as CSS variables like `var(--court)`, and the app gets them as Tailwind classes like `bg-court`.
- `styles/fonts.ts`: the brand font (Bricolage Grotesque), loaded once and used by both halves.
- `models/`: the shape of the core data (PlayerCard, Court, Crew, Game and so on), matching the database, so every feature describes a player the same way.
- `supabase/`: `createBinkClient()` makes a Supabase client from `.env.local`. `rpc.ts` has `call()`, which every data function uses to call a database function and turn its errors into a `BinkError`.
