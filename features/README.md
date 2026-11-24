# Features

The app's real code lives here, one folder per feature. The pages in `app/(app)/` stay short and import from these folders.

| Feature | Folder | Page | What it does |
|---|---|---|---|
| Player profile | `profile/` | `/profile` (planned) | Players enter their skill level, play style and other details |
| Matchmaking | `matching/` | `/players` | Uses profiles to find similar players who are open to play |
| Live map | `events-map/` | `/events` | Map of local events being hosted |
| King of the Court | `king-of-the-hill/` | `/hill` | A leaderboard per court; first place wears the crown |

## Where to start building

Each feature with a page has one entry file. Its page in `app/(app)/` renders that file and nothing else, so you can build the whole feature without touching `app/`.

| Feature | Edit this file |
|---|---|
| King of the Court | `king-of-the-hill/components/hill-screen.tsx` |
| Live map | `events-map/components/live-map-screen.tsx` |
| Matchmaking | `matching/components/matchmaking-screen.tsx` |

For now each one shows a placeholder (`components/feature-placeholder.tsx`) that marks the space and lists the starting scope. Replace it with the real screen. Run `npm run dev`, open http://localhost:3000/hill, and use the tabs at the top to move between the three.

## Inside a feature folder

As each feature gets built, it keeps its pieces together, for example:

```
features/matching/
├── components/   UI only this feature uses
├── data.ts       Reads and writes to the database (runs on the server only)
└── logic.ts      Rules, like how the match score between two players is worked out
```

UI used by more than one feature goes in the top-level `components/` folder. Anything the website also needs goes in `shared/`.
