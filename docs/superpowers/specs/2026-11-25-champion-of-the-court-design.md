# Champion of the Court: design

Date: 2026-11-25 · Status: draft for Ben's approval
Mockups: `design/champion-of-the-court.html` (open in a browser)
Builds on: King of the Court version 1 (`features/king-of-the-hill/`, commit 5a220ed) and the shared Supabase schema merged from `main` (`supabase/migrations/20261124120000_core.sql`).

## Why

King of the Court version 1 works, but it's flat. You log a game, see "Waiting for confirmation", and nothing happens. Ben wants three things:

1. **Logging a score feels exciting.** People should want to log right after a game.
2. **People want to look at each other's profiles**, starting from the leaderboard.
3. **People are driven to take the title** at their court and keep it.

The model is Strava's segment leaderboards: each court is a "segment" with its own board, and the title changes hands. The feature is renamed **Champion of the Court**, and the prize is a **golden pickleball paddle** instead of a crown.

## Goals

- Rename the in-app feature to Champion of the Court, with King / Queen / Champion titles
- Golden paddle replaces the crown everywhere; flame emoji removed everywhere
- Personal "how close you are" card on each court's board
- "If confirmed, you'd be #N" right after logging
- Full-screen celebration the first time a new champion opens the app
- Results count automatically after 24 hours unless disputed
- Tapping a player on a board opens their profile, with their stats at that court and an Ask to play button
- Data shaped to match the shared schema's results table, so moving to Supabase only touches `data.ts`

## Non-goals

- Push notifications. Nudges show in the app only, but are written so they could become notifications later.
- A shareable game card (saved for later). No "Share" button on the celebration.
- A setting for players to choose their own title (may come later if asked for).
- Connecting to a real Supabase project, or changing Graeme's matchmaking backend or migrations.
- Building chat or play requests. The Ask to play button uses what matchmaking provides, or is a placeholder until those screens exist (see "Ask to play").
- Skill-level boards, ratings, head-to-head or partner stats, seasons (still out, as in version 1).

## Anti-goals

- **A nudge that lies.** "Win 2 and you're Champion" must be true under the tie rules. Never promise a number that doesn't guarantee first place.
- **Separate boards by gender.** There's one board per court (per format). The title is only the word shown for whoever is first.
- **Messaging strangers directly.** Contact goes through Ask to play, as agreed for matchmaking.
- **Flames or crowns** left anywhere in the app.
- **Breaking matchmaking.** Graeme's code relies on `hill_streaks` having `court_id`, `player_id`, `streak`. Nothing here changes that.

## Approaches considered

| Option | Trade-off | Outcome |
|---|---|---|
| 1. Keep building on version 1's local file | Fastest to see, but its data shape drifts from the shared schema, so the Supabase switch means redoing the data side | Not chosen |
| 2. Rebuild straight on the shared Supabase schema | No switch later, but `main` only has singles results and no 24-hour rule (those are in Graeme's unmerged `dev` commit), and there's no Supabase project to click through yet | Not chosen |
| 3. **Rules as pure functions, screens on the local file, local data reshaped to match the shared results table** | A little care now keeping shapes aligned; in return Ben can click through everything today, and the switch to Supabase is a `data.ts` change | **Chosen by Ben** |

## Decided with Ben

### Name and titles
- The feature is **Champion of the Court** everywhere a player sees it: the app tab, the board header, badges, the profile. The `/hill` URL and the `king-of-the-hill/` folder keep their names for now.
- The title comes from the player's gender (the shared `players.gender` field):

  | Gender | Title |
  |---|---|
  | `woman` | Queen of [court] |
  | `man` | King of [court] |
  | `non_binary`, `prefer_not_to_say`, or blank | Champion of [court] |

- No setting to override it.
- In doubles, both partners hold the title. A mixed pair reads "King & Queen of Fernwood"; two women "Queens of Fernwood"; two men "Kings of Fernwood"; any pair including a Champion title reads "Champions of Fernwood". *(Claude's call on the plural wording.)*

### The golden paddle
- Replaces the 👑 everywhere: on the photo, on the board, on the champion card, in paddle history.
- In doubles, **both partners** get the gold ring and paddle on their photos, on the champion card and on the board row.
- Look (mockup approved, option A): a gold ring around the photo, and a small gold paddle tucked on the bottom-right corner of the photo, tilted about 20°. The paddle has a real pickleball shape: wide rounded-square face with an edge guard, short throat, wrapped navy grip, yellow end cap. Reference: `.superpowers/brainstorm/40530-1795622073/content/golden-paddle-v2.html`. Build it as one reusable SVG component.
- "Crown history" becomes **paddle history**: "Queen of Fernwood, Oct 2026 · Singles · Oct 3 to Oct 21".

### No flames
- The 🔥 is removed everywhere. A win streak shows as a small text tag next to the name, e.g. "3 in a row", from 3 confirmed wins in a row. *(3 is carried over from version 1.)*

### Each court's board, like a Strava segment
- One board per court, with the Singles / Doubles switch, counting the last 30 days, ranked as in version 1 (most wins, then point difference; the champion keeps first on an exact tie; at least 1 win needed).
- **Streaks on the board are per court**: the "3 in a row" tag on Fernwood's board counts only Fernwood games. *(Ben asked for streaks "at whatever court they click". Claude's call: the profile's general streak line also becomes per court when opened from a board; see Player profile.)*
- **What a streak counts** *(Claude's call)*: one player's own counted results in a row, at that court, in that board's format, not limited to the 30-day window. On a doubles row, the tag shows if both partners are on 3+; otherwise each name carries its own tag. This deliberately differs from matchmaking's `hill_streaks` (latest winner at the court, across formats), which stays untouched and only feeds matchmaking's +5 bonus.
- **Doubles and "you"** *(Claude's call)*: the doubles board ranks pairs, as in version 1. Personal lines (nudge card, "you'd move to #2", celebration) use the viewer's best-ranked pair at that court and name the partner: "You and Sam are #3. Win 3 together and the paddle's yours."

### Mixed doubles
- Mixed games count on the **doubles** board. There's one board for all two-on-two games while Bink is small, so a small player base isn't split across three boards per court.
- Games keep their real format: a mixed game is stored as `format = 'mixed'`, matching matchmaking's formats and the shared schema. The doubles board reads `doubles` and `mixed` games. A separate Mixed board later is then a filter change, not a data change.
- Streaks on the doubles board count both kinds of game.
- Reasoning: the research report's Foursquare warning (busy courts need split crowns or most players never win one) is a problem for when courts get busy, which Bink's courts aren't yet.

### Hiding where you play
Matchmaking is adding a setting that lets players hide which courts they play at (Graeme's `dev` branch, not yet on `main`). Champion of the Court respects it:

- A player who hides their courts **doesn't appear on any court's board**: no row, no "Hidden player" placeholder. A placeholder would still show that someone plays there, and it would make nudges read oddly.
- They **can't hold the paddle** and aren't ranked. Ranking, champion, nudges, "you'd move to #N" and the celebration all work as if they weren't on the board.
- **Their games still count for their opponents.** A win against a hidden player is a normal win for the visible player. A doubles pair is shown only if both partners are visible.
- Their profile, opened from anywhere, doesn't show per-court lines ("12 games at Fernwood", "3 in a row at Fernwood"), Court Regular, current titles or paddle history.
- They still see **their own** stats at each court, privately, on their own profile.
- Switching the setting off puts them back on boards from that moment, using their counted games in the window. Turning it on ends any paddle hold they have, and the next player takes the paddle (the normal hold rules).
- The note shown after someone logs their first game says: "Games you log show on this court's board. You can hide your courts in settings."
- Until Graeme's setting reaches `main`, the local player gets a `hide_courts` flag (off by default), switchable from the "Testing as" menu. When the shared field lands, only `data.ts` changes.
- Reasoning (from `reports/Pickleball app stats and features.md`): players should be able to hide from public boards and still see their own stats. Strava's Local Legend opt-out removes you from the competition entirely. Court activity combined with timing reveals a routine. And it's not yet known whether Victoria's older open-play crowd welcomes public per-court rankings.

### Logging a game
- Same form as version 1, renamed wording.
- After sending, instead of the plain "Game logged" note, the board shows where you'd land: "If Sam confirms, you'd move from #4 to #2 at Fernwood." If the win would make you champion: "If Sam confirms, you'll be Queen of Fernwood." For a loss, just "Game logged. Waiting for Sam to confirm."

### Confirming: the 24-hour rule
- A result counts when the other side confirms it, **or automatically 24 hours after it was logged** unless someone on the other side disputes it first. Disputed results never count.
- The 24 hours is one setting in one place.
- The waiting card shows time left: "Counts automatically in 18 h unless Sam disputes it." The confirm card for the opponent says the same from their side.
- This matches Graeme's `dev` branch (`hill_confirm_window()`), so the rules agree when that lands on `main`.

### Taking the paddle: the celebration
- When you become first at a court, the **next time you open the app** you see a full-screen moment, once (mockup approved, option A): dark navy background with confetti, your photo large with the golden paddle, "NEW CHAMPION", "You're the King of Fernwood", a line like "You passed Alex with your 7th win this month · 3 in a row", and a **See the board** button. No Share button.
- If you took several titles since you last looked, show one per court in turn. *(Claude's call.)*
- If you won the paddle and lost it again before opening the app, skip the celebration and show the lost-paddle line instead. "Celebration seen" is tracked per paddle hold. *(Claude's call.)*
- **When a hold starts** *(Claude's call)*: at the moment the result that put you first began to count (when it was confirmed, or logged time + 24 hours). Holds and history dates are worked out from those times, not from when someone next opens the app, so the order is always the same. Locally this stays lazy (recomputed on every read, as in version 1). The Supabase move needs a database function plus a scheduled job, as version 1's README already notes.
- Reference: `.superpowers/brainstorm/40530-1795622073/content/celebration.html`.

### Nudges (in the app only)
A personal card at the top of a court's board, for the viewer only, when they have at least one counted game at that court in the last 30 days and aren't the champion. It can show up to three lines:

1. **How close you are**: "You're #3 at Fernwood. Win 3 and the paddle's yours." The number is the wins that **guarantee** first place if nothing else changes: enough to have strictly more wins than the champion (an equal count loses on the tie rule unless point difference is known to favour you, so always count strictly more). *(Claude's call on the exact rule; it's what keeps the anti-goal.)*
2. **The paddle is up for grabs**, shown when true:
   - "3 of Alex's wins drop off this week": champion wins that leave the 30-day window in the next 7 days. When those drop, the "wins to take it" number updates.
   - "Alex hasn't played at Fernwood in 9 days": shown from 7 days without a counted game at that court. *(Claude's call on 7.)*
3. **A closer rival**: "Next up: Sam (#2) is 1 win ahead." The player directly above you, when that isn't the champion.

When you've **lost** the paddle, the card says so the next time you open that board: "Ben took the Fernwood paddle. You're 1 win behind. Win 2 to take it back." *(Claude's call: it replaces the board banner Ben didn't pick.)*

Write the nudge text in one place, as functions that return the sentence, so they can be reused as notifications later.

### Tapping a player on a board
Every name and photo on a board opens that player's profile. At the top, in this order:

```
 (photo + paddle if champion)  Jordan Lee
                               3 in a row at Fernwood
                               12 games at Fernwood · last 30 days
 ─────────────────────────────────────────────
 Matchmaking profile: skill, style, formats,
 home court, bio
 ─────────────────────────────────────────────
 [ Ask to play ]
 Current titles · Court Regular · Paddle history
```

- **Games at this court** and **streak at this court** are for the court the board was showing. Opening the profile without a court (for example from the Profile tab) shows the player's home court, or the court where they've played most in 30 days if no home court. *(Claude's call.)*
- **Matchmaking profile**: the fields matchmaking already defines (photo, skill or DUPR, style, formats, home court, bio). Version 1's local sample players don't have these, so the sample data gets them.

### Ask to play
- The button follows the matchmaking rule: it sends a play request, and a chat opens only once the other player accepts. No direct messages.
- Play requests and chat are Graeme's backend and have no screens yet. For now the button is shown but marked "Coming soon" (disabled), and no request is stored. *(Claude's call. The alternative, a local stand-in request, would be throwaway.)*
- Your own profile has no Ask to play button.

### Kept from version 1
- Court Regular badge and 📍 icon (most games at a court in 30 days).
- Confirm / Dispute, the score rules (to 11, win by 2), the 30-day window, the ranking and tie rules.
- The "Testing as" menu until sign-in exists.

## Data shape (approach 3)

Reshape the local store's games to match the results table on Graeme's `dev` branch, which is where the shared schema is heading:

- `hill_matches`: `id`, `court_id`, `format`, `score` (text, e.g. "11-7"), `played_at`, `recorded_by`, `status` (`pending` / `confirmed` / `disputed`), `responded_by`, `responded_at`, `created_at`
- `hill_match_players`: `match_id`, `player_id`, `won` (one row per player, both sides)

"Counts" = `confirmed`, or `pending` and older than the 24-hour window. Point difference comes from parsing `score`.

Players gain the matchmaking fields the profile shows (gender, skill, style, formats, home court, bio) in the same names as the shared `players` table, plus a local `hide_courts` flag (see "Hiding where you play").

`format` is `singles`, `doubles` or `mixed`. The doubles board counts `doubles` and `mixed`.

Two things the shared schema doesn't have yet, kept locally and flagged for the Supabase move:
- **Paddle holds** (version 1's `crowns`): court, format, player ids, started, ended.
- **Celebration seen**: which new titles each player has already been shown.

## What's left to the builder

- File layout inside `features/king-of-the-hill/` and how the pure rules are split (version 1's `logic.ts` is the starting point).
- How the local store migrates its existing `.data/bink-local.json` (resetting it is fine: it only holds test games).
- Confetti and the full-screen moment's animation, within the approved mockup.
- Exact wording of small labels not quoted here, in the same plain voice.
- Tests: every rule above (title from gender, wins-to-guarantee, expiring wins, closest rival, 24-hour counting, per-court streak, celebration once, mixed games on the doubles board, hidden players left off boards while their opponents keep the wins) gets a unit test, as version 1's rules do.

## Calls made by Claude (changeable)

- Plural titles for doubles pairs
- Profile streak and game count are per court when opened from a board; otherwise home court
- "Wins to take it" always counts strictly more wins than the champion
- "Hasn't played" line from 7 days; "drop off this week" = next 7 days
- The lost-paddle line on the nudge card
- Several new titles → one celebration each, in turn
- Ask to play shown as "Coming soon" until matchmaking's screens exist
- Streak tag from 3 in a row
- Hiding: a doubles pair shows only if both partners are visible; turning hiding on ends a current paddle hold; a hidden player's profile drops per-court lines, titles and paddle history
