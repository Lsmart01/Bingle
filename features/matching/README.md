# Matchmaking

The "Find players in Victoria" directory, ranked "for you", plus games, crews, play requests and chat. The design is in `docs/superpowers/specs/2026-11-24-matchmaking-design.md`.

**Start here:** `components/matchmaking-screen.tsx` is what `/players` shows. It's still a placeholder. The backend below is built and tested; the screens are next.

## Files

| File | What it does |
|---|---|
| `data.ts` | Everything the screens call: `getForYou`, `getGame`, `getCrew`, `getPlayerProfile`, `getMyRequests`, and the writes (`createGame`, `createCrew`, `askToJoinGame`, `askToJoinCrew`, `askToPlay`, `respondToRequest`, `cancelRequest`, `leaveGame`, `leaveCrew`, `cancelGame`, `setCrewOpen`, `blockPlayer`, `unblockPlayer`, `markActive`) |
| `chat.ts` | `getConversations`, `getMessages`, `sendMessage`, and `subscribeToMessages` for live updates |
| `scoring/settings.ts` | Every ranking number, including strict mode. Tuning Bink is a one-line edit here |
| `scoring/score.ts` | How well one player, crew or game fits the viewer (0–100, +5 hill bonus), and dealbreakers |
| `scoring/rank.ts` | Builds the directory sections, with the daily shuffle |

Each function takes a Supabase client signed in as the viewer. The database works out who that is, so nobody can act as someone else. Failures throw a `BinkError` whose message can be shown to the player as is, for example "This game is full."

`getForYou()` returns four lists: `games`, `best_matches`, `everyone_else` and `not_looking`. Scores are left out on purpose: players see the order, never the numbers. Call it on the server (a Server Component or Route Handler).

## Warnings the screens need to show

- `GameDetail.blocked_player_names` / `CrewDetail.blocked_player_names`: if this isn't empty, ask "Are you sure? [name] is playing in this match." before calling `askToJoinGame` / `askToJoinCrew`. Only the person who did the blocking ever gets this list.
- `GameEntry.has_blocked_player` / `CrewEntry.has_blocked_player`: the same thing, on directory cards.

## Depends on

- `profile/`: every input to matching comes from profile fields.
