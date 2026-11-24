import { respondAction } from "../actions";
import type { GameSummary } from "../data";
import { formatLabel, joinNames, shortDate } from "../format";

// Games that aren't confirmed yet: ones the viewer needs to answer, and ones
// they logged that are waiting on the other side.
export function PendingGames({ toConfirm, waiting }: { toConfirm: GameSummary[]; waiting: GameSummary[] }) {
  if (toConfirm.length === 0 && waiting.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {toConfirm.map((g) => {
        const loggerWon = g.scoreA > g.scoreB;
        const others = g.teamB.length > 1 ? "you and your partner" : "you";
        return (
          <div key={g.id} className="rounded-2xl bg-card p-4 ring-2 ring-ball">
            <p className="text-sm">
              <b>
                {joinNames(g.teamA)} logged a {loggerWon ? "win over" : "loss to"} {others}, {g.scoreA}–{g.scoreB}
              </b>
              <br />
              <span className="text-muted">
                {shortDate(g.playedAt)} · {g.courtName} · {formatLabel(g.format)}
              </span>
            </p>
            <form action={respondAction} className="mt-3 flex gap-2">
              <input type="hidden" name="gameId" value={g.id} />
              <button
                name="response"
                value="confirm"
                className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-card hover:opacity-90"
              >
                Confirm
              </button>
              <button
                name="response"
                value="dispute"
                className="rounded-full border border-line px-4 py-2 text-sm font-bold hover:bg-mint"
              >
                Dispute
              </button>
            </form>
          </div>
        );
      })}

      {waiting.map((g) => {
        const won = g.scoreA > g.scoreB;
        return (
          <div key={g.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
            <p className="min-w-0 flex-1 text-sm">
              <b>
                {won ? "Win" : "Loss"} vs {joinNames(g.teamB)}, {g.scoreA}–{g.scoreB}
              </b>
              <br />
              <span className="text-muted">
                {shortDate(g.playedAt)} · {g.courtName} · {formatLabel(g.format)}
              </span>
            </p>
            <span className="flex-none rounded-full bg-mint px-3 py-1 text-xs font-bold text-muted">
              Waiting for confirmation
            </span>
          </div>
        );
      })}
    </div>
  );
}
