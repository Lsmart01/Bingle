# Bink

Find pickleball players your level in Victoria.

## Stack

- **Next.js 16** (React and TypeScript): the website and the app in one project
- **Tailwind CSS**: styling for the app (the website keeps its own CSS)
- **Supabase**: database, login and live updates (not connected yet)
- **Cloudflare Workers**: hosting, through the OpenNext adapter. Cloudflare also runs the binkpb.com domain

## Run it locally

You need Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other commands: `npm run build` makes a production build, `npm run lint` checks the code, and `npm run preview` runs the production build in Cloudflare's runtime at http://localhost:8787. Before deploying, run `npm run preview` to catch anything that works in `npm run dev` but breaks on Cloudflare.

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
│   └── models/               Data shapes: Player, Event, Match, Challenge
├── public/images/            Photos and other static files
├── supabase/                 Database tables and their change history (once connected)
└── design/                   Design exports and mockups (reference only)
```

Each folder has a README with more detail.

## Deploying

Bink runs on Cloudflare Workers. [OpenNext](https://opennext.js.org/cloudflare) turns the Next.js build into a Worker. The settings are in `wrangler.jsonc` (the Worker) and `open-next.config.ts` (the adapter).

To deploy from your computer, run `npm run deploy`. The first time, it opens a browser so you can log in to Cloudflare. The Mapbox token is baked into the build, so `.env.local` must have it.

To deploy automatically on every push to `main`, connect this GitHub repo to the `bink` Worker in the Cloudflare dashboard (**Workers & Pages → bink → Settings → Builds**). Use `npx opennextjs-cloudflare build` as the build command and `npx opennextjs-cloudflare deploy` as the deploy command, and add `NEXT_PUBLIC_MAPBOX_TOKEN` as a build variable.

Two things to know:

- `cacheComponents` is off in `next.config.ts` because pages hang on Workers with it on. Check the link in that file before turning it back on.
- Pages can't refresh themselves after a deploy (`revalidate`) until the R2 cache is set up. See `open-next.config.ts`.

## Notes for coding agents

`AGENTS.md` comes from Next.js. It tells coding agents to read the docs bundled in `node_modules/next/dist/docs/`, because this version of Next.js differs from older ones.
