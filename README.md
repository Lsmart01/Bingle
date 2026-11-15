# Bingle

Find pickleball players your level in Victoria.

## Stack

- **Next.js 16** (React and TypeScript): the website and the app in one project
- **Tailwind CSS**: styling for the app (the website keeps its own CSS)
- **Supabase**: database, login and live updates (not connected yet)
- **Vercel**: hosting

## Run it locally

You need Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other commands: `npm run build` makes a production build, and `npm run lint` checks the code.

## How this repo is organized

```
Bingle/
├── app/                      Pages and URLs (each folder is a URL)
│   ├── (website)/            Public site: homepage now; about, FAQ, login, sign-up later
│   └── (app)/                Signed-in app: profile, players, events, hill (not built yet)
├── features/                 The app's real code, one folder per feature
│   ├── profile/              Player profiles: skill level, play style, open to play
│   ├── matching/             Matching matrix: find players like you
│   ├── events-map/           Map of local events
│   └── king-of-the-hill/     Win streaks and challenges
├── components/               UI used by more than one feature
├── shared/                   Used by both the website and the app
│   ├── auth/                 Sign-in and session handling
│   ├── styles/               Brand colours (tokens.css) and font (fonts.ts)
│   └── models/               Data shapes: Player, Event, Match, Challenge
├── public/images/            Photos and other static files
├── supabase/                 Database tables and their change history (once connected)
└── design/                   Design exports and mockups (reference only)
```

Each folder has a README with more detail.

## Deploying

Bingle is hosted on Vercel. To set it up, import this GitHub repo at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js, so the default settings work. After that, every push to `main` updates the live site, and every other branch gets its own preview link.

Vercel's free plan is for non-commercial projects only, so Bingle needs the Pro plan.

## Notes for coding agents

`AGENTS.md` comes from Next.js. It tells coding agents to read the docs bundled in `node_modules/next/dist/docs/`, because this version of Next.js differs from older ones.
