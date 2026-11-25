# Bink

Find pickleball players your level in Victoria.

## Stack

- **Next.js 16** (React and TypeScript): the website and the app in one project
- **Tailwind CSS**: styling for the app (the website keeps its own CSS)
- **Supabase**: database, login and live chat. The schema and backend are built and tested; no live project is connected yet (see `supabase/README.md`)
- **Vercel**: hosting

## Run it locally

You need Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other commands: `npm run build` makes a production build, `npm run lint` checks the code, `npm run typecheck` checks the types, and `npm test` runs the tests, including the database ones (no Supabase or Docker needed).

## How this repo is organized

```
Bink/
├── app/                      Pages and URLs (each folder is a URL)
│   ├── (website)/            Public site: homepage now; about, FAQ, login, sign-up later
│   └── (app)/                Signed-in app: /hill, /events, /players (placeholders); /profile later
├── features/                 The app's real code, one folder per feature
│   ├── profile/              Player profiles: skill level, play style, open to play
│   ├── matching/             Matchmaking: find players like you
│   ├── events-map/           Live map of local events
│   └── king-of-the-hill/     Ranked win streaks and challenges
├── components/               UI used by more than one feature
├── shared/                   Used by both the website and the app
│   ├── auth/                 Sign-in and session handling
│   ├── styles/               Brand colours (tokens.css) and font (fonts.ts)
│   ├── models/               Data shapes: PlayerCard, Court, Crew, Game
│   └── supabase/             Supabase client and the rpc() helper every data function uses
├── public/images/            Photos and other static files
├── supabase/                 Database migrations (tables, access rules, functions) and seed data
├── tests/db/                 Database tests: the real migrations in an in-memory Postgres
└── design/                   Design exports and mockups (reference only)
```

Each folder has a README with more detail.

## Deploying

Bink is hosted on Vercel. To set it up, import this GitHub repo at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js, so the default settings work. After that, every push to `main` updates the live site, and every other branch gets its own preview link.

Vercel's free plan is for non-commercial projects only, so Bink needs the Pro plan.

## Notes for coding agents

`AGENTS.md` comes from Next.js. It tells coding agents to read the docs bundled in `node_modules/next/dist/docs/`, because this version of Next.js differs from older ones.
