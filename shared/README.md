# Shared

Code and settings that both the website and the app use. Only put something here when both sides need it.

- `auth/`: sign-in and session handling. Until Supabase auth is connected, it has a testing-only "Testing as" menu so you can act as any sample player. `getViewerId()` is the one place to swap for the real signed-in user.
- `styles/tokens.css`: the Bink colours, with light and dark versions. The website uses them as CSS variables like `var(--court)`, and the app gets them as Tailwind classes like `bg-court`.
- `styles/fonts.ts`: the brand font (Bricolage Grotesque), loaded once and used by both halves.
- `models/`: the shape of the core data, such as Player, Event, Match and Challenge, so every feature describes a player the same way.
