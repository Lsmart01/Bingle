# Matchmaking: for-you ranking, crews and games — design

Date: 2026-11-24 · Status: draft, awaiting approval
Builds on: [2026-11-24-supabase-backend-design.md](2026-11-24-supabase-backend-design.md) (courts, players, player_courts, king of the hill). That design stays as approved; this one adds to it and replaces its "placeholder directory order".

## Why

Bink is a pickleball matchmaking app for Victoria. People find others to play with in two ways:

1. **The live map.** It shows only Victoria's pickleball courts. Tapping a court shows the players who call it home or play there often, that court's king of the hill, and any open games at that court.
2. **"Find players in Victoria".** A directory of everyone playing in Victoria, ranked like a "for you" page so the best matches come first.

Since this is a matchmaking app, the directory's order is the product. At launch there will be few players, so the founder's priority is: **everyone can find as many people as possible, with ideal matches first.** Nobody should see an empty page.

The founder also wants **duos and trios** who need 1 or 2 more players to be findable, both as **standing crews** ("we play Thursdays, need a regular fourth") and as **single games** ("Oak Bay tonight 6pm, needs 1").

## Goals

- New profile fields the ranking needs, plus a short bio
- Crews, games and join requests in the database, with access rules
- A scoring function that ranks players, crews and games for a given viewer, using the agreed points table
- Read functions for the directory (games strip, best matches, everyone else) and for one game's detail
- Write functions for creating a game or crew, asking to join, and accepting or declining
- Tests of the scoring using made-up players

## Non-goals

- Screens. The mockups below show what the backend must support. Building the UI is a separate project.
- Notifications and push messages (chat works inside the app only)
- Learning from behaviour (who people actually message or play with). The weights are fixed numbers for now.
- Anything special about mixed doubles pairing by gender
- Running against a live Supabase project. As with the backend foundation, there is no Supabase project yet, and Node.js is not installed on this machine. The scoring tests need Node installed first.

## Anti-goals

- An empty or near-empty directory. During launch, nothing hides a player except deleting their account.
- Showing match scores to players. They see the order, never the numbers.
- Exposing anyone's phone number or email to other players. People talk through Bink chat and share details there only if they choose to.
- Changing what the app does today. No current page imports the new code.

## Approaches considered

| Option | Trade-off | Outcome |
|---|---|---|
| **1. Score in the app's code (TypeScript)** | Weights live in one readable file and can be tested without Supabase. Loads all Victoria players per request, which is fine for hundreds but not thousands | **Chosen**: launch is small and weights will change often |
| 2. Score in the database (SQL function) | Faster at scale and reusable by a future phone app, but hard to read and tweak, and untestable until Supabase runs | Not chosen; this is the move once Bink outgrows option 1 |
| 3. Pre-calculate and store scores | Built for big scale, but complex | Dropped as overkill |

## What gets matched on

Ten things, decided with the founder:

1. Format: singles, doubles, mixed (a player can pick several)
2. Competitive vs. chill: `fun` / `social` / `competitive` (already in the players table, in that order)
3. Skill: DUPR if the player has one, otherwise their self-rating (2.0 to 5.0)
4. Age
5. Gender
6. When they play: usual time slots
7. Where they play: home court, courts they play often, area of Victoria
8. Open to play (on/off)
9. Activity: how recently they used Bink
10. King of the hill record

## Data additions

The backend foundation hasn't been built yet, so it and these additions are built together as **one schema with the final columns from the start**. There's no throwaway play-times column and no placeholder directory order.

**courts** gains `area`: the area of Victoria the court is in, filled in by the seed data. Crews and games get their area from their court.

**players** gains:
- `bio`: up to 150 characters
- `birth_date`: age is worked out from this. Only age is ever shown, never the date
- `gender`: `woman` / `man` / `non_binary` / `prefer_not_to_say`
- `formats`: one or more of `singles` / `doubles` / `mixed`
- `play_times`: a set of time slots. A slot is a day of the week plus `morning` / `afternoon` / `evening`, so 21 possible slots. This replaces the earlier free-form "usual play times"
- `last_active_at`: updated when the player opens the app
- `pref_age_min`, `pref_age_max`: optional
- `pref_gender`: optional, the gender(s) the player wants to play with

**crews** (new): name, home court, format, style (`fun` / `social` / `competitive`), play times (same slots), `is_open` (still looking), created by. A crew has 2 or 3 members and is looking to make 4. "Needs" is 4 minus members, worked out, not stored.

**crew_members** (new): crew ↔ player. A player can be in more than one crew.

**games** (new): court, `starts_at`, format, target level (a skill number, optional), style (optional), note (optional, up to 150 characters), host player. Total players: 2 for singles, 4 for doubles and mixed. "Needs" is total minus players in the game, worked out, not stored. A game is **listed** only while it isn't full, hasn't started, and is no more than 7 days away.

**game_players** (new): game ↔ player. The host is always in it.

**join_requests** (new): who is asking, a crew or a game (exactly one), status `pending` / `accepted` / `declined`, created at. Accepting adds the requester to `crew_members` or `game_players`, and is refused if that would make it overfull.

## Access rules (RLS)

On top of the backend foundation's rules:
- Signed-in users can read crews, crew members, listed games and game players.
- Anyone can create a game (as its host) or a crew (as a member).
- Only the host can edit or cancel a game. Any crew member can edit their crew or mark it full.
- A player can create a join request for themselves. They can see their own requests. The game host, or any crew member, can see requests for it and accept or decline them.
- `birth_date` is never sent to other players, only age. The builder may need a view or function to make this column-level rule work.
- Chat: only members of a conversation can read or send its messages. See Stage 2.

## The scoring

Scores run 0 to 100 (plus a 5-point bonus) for each thing listed, from the viewer's point of view.

| Metric | Max | How it scores |
|---|---|---|
| Skill | 25 | Gap between the viewer's and their skill: 0 → 25 · ≤0.25 → 20 · ≤0.5 → 12 · ≤0.75 → 5 · more → 0 |
| When they play | 20 | 20 × (shared slots ÷ the viewer's slots). Viewer with no slots set: everyone gets 10 |
| Where they play | 15 | Same home court 15 · plays at one of the viewer's courts 10 · same area 5 · else 0 |
| Competitive vs. chill | 15 | Same 15 · one step apart (fun↔social, social↔competitive) 7 · fun vs. competitive 0 |
| Format | 10 | Plays all the viewer's formats 10 · some 5 · none 0 |
| Activity | 10 | Active within 7 days 10 · 30 days 6 · 60 days 2 · older 0 |
| Age | 5 | Within the viewer's preferred range 5 · outside 0 · viewer has no preference: 5 |
| Hill record | +5 | Only when the viewer is competitive: has a current streak at a court the viewer plays at |

**Crews** are scored the same way, using: average skill of members, the crew's style, format, play times and home court, the most recent activity of any member, and age as the members' average.

**Games** are scored the same way, with three changes:
- Skill uses the game's target level, or the players' average if none is set.
- "When they play" becomes **time fit**: 20 if the game's day and part of day is one of the viewer's slots, 10 if it's on one of the viewer's days at a different time, 0 otherwise.
- Activity is always 10, since a game being posted is activity.

**Dealbreakers (launch mode).** These used to remove people. At launch they don't hide anyone. Instead, anyone who hits one can't appear in "Best matches" and goes to "Everyone else":
- skill gap more than 1.0
- no shared format
- inactive more than 60 days
- outside the viewer's gender preference (only if the viewer set one)

There's one setting, **strict mode**, off at launch. Turning it on hides dealbreaker hits entirely. The founder will switch it on once the directory is full enough (rough guide: a typical player has 30+ people scoring 60 or more).

**Games and crews follow the same dealbreaker rules** as players: in launch mode a hit moves a crew to "Everyone else" and a game to the end of the games strip; in strict mode it hides them. The games strip has no 60-point bar. For a crew, the gender preference counts as met only if every member meets it.

**Missing information never counts against someone.** Formats, skill, style, birth date and a profile photo are required at sign-up. Gender and play times are optional. When something is missing, that metric gets half its points (age 2.5 out of 5, when-they-play 10 out of 20) and is never a dealbreaker.

**Not looking.** Players with "open to play" off always go to the very bottom, labelled "Not looking right now", in any mode. Crews marked full aren't listed.

**Shuffle.** Entries within 3 points of each other are shuffled, so the same few people don't always top the page. The shuffle is the same for a given viewer on a given day, so the list doesn't jump on every refresh.

**The viewer never appears in their own results.** Neither do crews they belong to or games they're in.

All numbers above (weights, steps, the 60 cut-off, the 3-point shuffle, 7-day game window, 60-day inactivity) live together in one settings object, so changing them is a one-line edit.

**Worked example.** Viewer: 3.5, competitive, doubles and mixed, Tue and Thu evenings, home court Oak Bay, no age preference.
- Player A: 3.5, competitive, doubles only, Thu evening, plays at Oak Bay, active this week → 25 + 10 + 10 + 15 + 5 + 10 + 5 = **80**
- Player B: 4.0, social, doubles and mixed, Tue and Thu evenings, home Oak Bay, active this month → 12 + 20 + 15 + 7 + 10 + 6 + 5 = **75**

These two should be the first test cases.

## What the app gets back

**Directory** (`getForYou(viewerId)`), in three sections:
1. **Games needing players**: listed games, best score first
2. **Best matches for you**: players and crews scoring 60+ with no dealbreaker hit, best first
3. **Everyone else in Victoria**: all remaining players and crews by score, then "Not looking right now" players last

Each entry carries what a card shows: photo (for crews, members' photos), name, age, skill, style, area or court, bio, and for crews and games, how many are needed.

**Game detail** (`getGame(gameId)`): court, time, format, level, style, note, needs, and the players in it (host marked), each with card info.

**Court on the map**: the backend foundation's `getCourtDetail(courtId)` also returns that court's listed games.

**Writes:** create game, create crew, ask to join (crew or game), accept or decline a request, leave a game or crew, cancel a game, mark a crew full or open.

## How it will look (mockups, for reference)

Agreed with the founder. These show what the data has to support:
- **Directory**: Facebook Marketplace-style grid, two cards per row. Square photo, "Name, age", "skill · style · area", bio cut off at two lines. Games show as court tiles labelled "Needs 1". Crews show their members' photos together, labelled "Crew · needs 1".
- **Profile** (tap a card): big photo, name and age, everything matched on shown as tags (DUPR, style, formats, home court, play times, hill streak), the full bio, an "Ask to play" button.
- **Create game**: court, when, format, who's already playing, level, optional note. "Needs" is shown, worked out automatically.
- **Game detail** (tap a game tile): court, time, tags, note, "Who's playing · 3 of 4" with each player's card (host marked), a dashed "open spot" card, and "Ask to join".

## Stage 2: play requests and in-app chat

Decided by the founder. It's built after Stage 1 (everything above: data, ranking, directory, games, crews, join requests), as part of this same design.

**Play requests.** "Ask to play" on a player's profile sends a play request to that player. `join_requests` gains a third possible target, a player, so a request targets exactly one of a crew, a game or a player. The player accepts or declines. The blocking rule still applies: a request to someone who has blocked you is declined automatically, and you aren't told why.

**Chat.**
- An accepted play request opens a **one-to-one chat** between the two players.
- Every game and crew has a **group chat**. Its members are the game's players or the crew's members, and anyone accepted later is added.
- Leaving a game or crew removes you from its chat. A cancelled game's chat becomes read-only.
- Messages are text only, delivered live (Supabase Realtime) and kept.
- Phone numbers and emails are never shared automatically. People can type them into chat if they choose.

**Blocking in chat.** Blocking someone ends your one-to-one chat with them, and neither of you can send in it. In a group chat you share, you no longer see messages from someone you blocked. *(Claude's call.)*

**Data:** `conversations` (one-to-one, game or crew, linked to that game or crew), `conversation_members`, and `messages` (conversation, sender, text, sent at). Access rules: only members can read a conversation or post to it.

**Not in Stage 2:** photos or files in chat, read receipts, typing indicators, push notifications, message editing.

## Calls made by Claude (changeable)

- Bio capped at 150 characters
- Crews always aim for 4 players
- Store birth date, show only age; age is shown on cards
- Time slots are day × morning/afternoon/evening
- Joining is by request that a host or crew member accepts, never automatic
- Phone numbers aren't stored on profiles; the sign-in email stays private
- Games show up to 7 days ahead
- Shuffle is fixed per viewer per day
- A dealbreaker hit keeps someone out of "Best matches" even with a high score
- Self-rated skill counts the same as DUPR
- The foundation and these additions are built as one schema
- Courts get an `area` field
- Missing optional info scores half points and is never a dealbreaker
- Dealbreakers and strict mode apply to crews and games too; a crew meets a gender preference only if all members do

## Founder decisions (2026-11-24, second round)

- **Age: Bink is 18+.** Sign-up refuses anyone under 18, based on birth date, which becomes **required**. (14+ was considered first, then dropped to avoid adults and minors exchanging contact details.) The age-preference range starts at 18.
- **Profile photo is required** at sign-up.
- **Signed-out visitors can browse the directory**, but must sign in to ask to play, ask to join, post a game or chat.
- **Contact happens through in-app chat**, not by sharing phone numbers or email. This replaces an earlier decision to share both. See Stage 2.
- **Blocking.** A player can block another. Blocked players disappear from each other's directory and court player lists. Games are the exception: if a game includes someone you blocked, it still shows, and tapping "Ask to join" warns you first: "Are you sure? [name] is playing in this match." **Only the person who did the blocking gets this warning.** A blocked person joining a game with their blocker is never told. If two players have blocked each other, both are warned. *(Claude's call: a blocked person's requests to the blocker's own games or crews are declined automatically, without telling them.)*
- **Bink's own events** (drop-ins, clinics, The Bink Open) show on the live map with confetti over them. They come from the events work, not this design. The map just needs a way to show them.
- **King of the hill is Ben's.** The `hill_matches` table, streaks and challenge rules from the backend foundation are left to Ben. This design only reads a player's current streak for the +5 bonus. Founder's rule to pass on to Ben: a submitted score needs the opponent's confirmation, and **an opponent who doesn't respond in time is counted as the loser**.

## Still open (founder to confirm)

1. **"Prefer not to say" vs. a gender preference.** Claude's pick: such players **count as outside** a viewer's gender preference. The alternative is to count them as matching, so leaving gender blank never excludes anyone.
## Follow-up projects (not in this design)

- **Reporting and bans.** Score confirmation already exists (a hill result counts only once both players confirm it). The founder also wants players who lie about scores to be reportable and bannable. That needs reports, a review step and account blocking, and gets its own design.

## Left to the builder

- Exact column types, enums vs. text checks, and indexes
- How to keep `birth_date` private at the column level (view, separate table, or function)
- File layout within `features/matching/` and how the scoring is split into functions
- Test runner choice (Vitest is a good fit for this Next.js project)
- Seed data for crews and games, alongside the existing made-up players
