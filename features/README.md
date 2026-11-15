# Features

The app's real code lives here, one folder per feature. The pages in `app/(app)/` stay short and import from these folders.

| Feature | Folder | Planned page | What it does |
|---|---|---|---|
| Player profile | `profile/` | `/profile` | Players enter their skill level, play style and other details |
| Matching | `matching/` | `/players` | Uses profiles to find similar players who are open to play |
| Events map | `events-map/` | `/events` | Map of local events being hosted |
| King of the hill | `king-of-the-hill/` | `/hill` | Players on win streaks, and challenging them |

## Inside a feature folder

As each feature gets built, it keeps its pieces together, for example:

```
features/matching/
├── components/   UI only this feature uses
├── data.ts       Reads and writes to the database (runs on the server only)
└── logic.ts      Rules, like how the match score between two players is worked out
```

UI used by more than one feature goes in the top-level `components/` folder. Anything the website also needs goes in `shared/`.
