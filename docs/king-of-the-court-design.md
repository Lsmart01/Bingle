# Champion of the Court: design summary

Date: 2026-11-25 · Branch: `champion-of-the-court`
Full design: `docs/superpowers/specs/2026-11-25-champion-of-the-court-design.md`

## Why

- Logging a score should feel exciting
- People should want to look at each other's profiles
- People should be driven to take the title at their court
- Model: Strava segments. Each court has its own leaderboard, and the title changes hands

## Final decisions

**Name and titles**
- Feature renamed from King of the Court to **Champion of the Court** (app, website, READMEs)
- Title set from the player's gender: woman → Queen, man → King, anyone else or blank → Champion
- Players can't change their title
- One leaderboard per court for everyone, no separate boards by gender
- Doubles: both partners hold the title ("King & Queen of Fernwood"), and both get the gold ring and paddle

**Look**
- A **golden pickleball paddle** replaces the crown everywhere
- Paddle tucked on the corner of the photo, with a gold ring (mockup option A)
- Real paddle shape: rounded-square face, edge guard, wrapped grip, end cap
- **No flame emoji anywhere.** Streaks show as a text tag, e.g. "3 in a row"

**Leaderboard**
- One board per court, Singles / Doubles switch, last 30 days
- Most wins first, then point difference; on an exact tie the champion stays first
- Win streaks shown per court
- **Mixed doubles goes on the doubles board.** Games are still saved as `mixed`, so a separate Mixed board can be added later when courts get busy
- **Players who hide their courts are left off boards entirely** (no "Hidden player" row) and can't hold the paddle. Their games still count for their opponents, and they still see their own stats. First-game note: "Games you log show on this court's board. You can hide your courts in settings."

**Logging and confirming**
- After logging: "If Sam confirms, you'd move from #4 to #2"
- A result counts once confirmed, **or automatically after 24 hours** unless disputed
- Disputed results never count

**Taking the paddle**
- Full-screen celebration the next time the new champion opens the app (mockup option A)
- No Share button for now

**Nudges (in the app only, on the court's board)**
- How close you are: "Win 3 and the paddle's yours" (always the number that guarantees first)
- Paddle up for grabs: "3 of Alex's wins drop off this week", "Alex hasn't played here in 9 days"
- A closer rival: "Sam (#2) is 1 win ahead"
- If you lost it: "Ben took the Fernwood paddle. Win 2 to take it back"

**Tapping a player on a board**
- Shows: games at this court, win streak at this court, matchmaking profile, **Ask to play** button
- No direct messages: Ask to play first, and the chat opens once they accept

**How it's built (approach 3)**
- Rules as plain, tested functions
- Screens keep running on the local test file for now
- Local data shaped like the shared Supabase results table, so the switch later only touches `data.ts`

## In version 1

The first build of Champion of the Court, on top of the King of the Court code already in the repo.

- Everything under "Final decisions"
- Kept from before: Log a game form, Confirm / Dispute, score rules (to 11, win by 2), Court Regular badge, paddle history (was crown history), "Testing as" menu
- Ask to play button shown as "Coming soon" until matchmaking's request and chat screens exist
- The hide-courts setting stored locally (off by default) until Graeme's setting reaches `main`, and switchable from the "Testing as" menu

## Not in version 1

- Push notifications (nudges are written so they can become notifications later)
- Shareable game card
- Players choosing their own title
- Separate boards by skill level
- Ratings (Elo, DUPR-based)
- Head-to-head and partner stats
- Seasons
- Connecting a real Supabase project
- Any change to Graeme's matchmaking backend

## Open questions

- **Graeme's `dev` changes** (doubles results, the 24-hour rule) aren't on `main` yet. The switch to Supabase waits until they are

## Calls Claude made (changeable)

- Streak tag from 3 wins in a row; streaks count per court and per format
- Doubles nudges use your best-ranked pair and name your partner
- "Hasn't played" line from 7 days; "drop off this week" means the next 7 days
- A paddle hold starts when the winning result began to count
- No celebration if you won and lost the paddle before opening the app
- Several new titles at once: one celebration per court, in turn
- A doubles pair shows only if both partners are visible; turning hiding on hands the paddle to the next player
