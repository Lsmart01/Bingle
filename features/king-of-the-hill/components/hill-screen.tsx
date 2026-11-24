import Link from "next/link";
import { Suspense } from "react";
import { PlayerAvatar } from "@/components/player-avatar";
import { PlayerName } from "@/components/player-name";
import { getViewerId } from "@/shared/auth/test-player";
import { getHillView, type HillView, type PlayerChip } from "../data";
import { formatLabel, shortDate, signed } from "../format";
import type { Format } from "../types";
import { PendingGames } from "./pending-games";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// King of the Court: this is what /hill shows. One leaderboard per court,
// with a Singles / Doubles switch.
export function HillScreen({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="text-muted">Loading the courts…</p>}>
      <Hill searchParams={searchParams} />
    </Suspense>
  );
}

async function Hill({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const format: Format = params.mode === "doubles" ? "doubles" : "singles";
  const viewerId = await getViewerId();
  const view = await getHillView(typeof params.court === "string" ? params.court : undefined, format, viewerId);
  const href = (courtId: string, mode: Format) => `/hill?court=${encodeURIComponent(courtId)}&mode=${mode}`;
  const king = view.rows.find((r) => r.isKing) ?? null;

  return (
    <section aria-labelledby="court-name" className="pb-24">
      <div className="rounded-3xl bg-court px-5 pt-5 text-white sm:px-7 sm:pt-6">
        <p className="text-xs font-bold tracking-[0.12em] text-ball uppercase">King of the Court</p>
        <h1 id="court-name" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {view.court.name}
        </h1>

        <nav aria-label="Courts" className="mt-4">
          <ul className="flex flex-wrap gap-2">
            {view.courts.map((c) => {
              const on = c.id === view.court.id;
              return (
                <li key={c.id}>
                  <Link
                    href={href(c.id, format)}
                    aria-current={on ? "page" : undefined}
                    className={`block rounded-full px-3 py-1.5 text-sm font-semibold ${
                      on ? "bg-white text-court" : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav aria-label="Singles or doubles" className="mt-3 flex gap-6">
          {(["singles", "doubles"] as const).map((m) => {
            const on = m === format;
            return (
              <Link
                key={m}
                href={href(view.court.id, m)}
                aria-current={on ? "page" : undefined}
                className={`border-b-[3px] pt-2 pb-2.5 font-bold ${
                  on ? "border-ball text-white" : "border-transparent text-white/55 hover:text-white"
                }`}
              >
                {formatLabel(m)}
              </Link>
            );
          })}
        </nav>
      </div>

      {params.logged === "1" && (
        <p role="status" className="mt-4 rounded-2xl bg-mint px-4 py-3 text-sm">
          <b>Game logged.</b> It shows as waiting for confirmation, and counts on the board once the other side confirms it.
        </p>
      )}

      <PendingGames toConfirm={view.toConfirm} waiting={view.waiting} />

      {king && <KingCard view={view} king={king} />}

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-extrabold">Leaderboard</h2>
        <span className="text-xs text-muted">Confirmed games, last 30 days</span>
      </div>
      <Board view={view} />

      <p className="mt-3 text-center text-xs text-muted">Most wins ranks first. Ties go to the bigger point difference.</p>

      <CourtRegular view={view} />

      <div className="fixed inset-x-0 bottom-0 z-10 bg-linear-to-t from-page via-page/90 to-transparent px-4 pt-6 pb-5 sm:px-6">
        <Link
          href={`/hill/log?court=${encodeURIComponent(view.court.id)}&mode=${format}`}
          className="mx-auto flex h-13 max-w-md items-center justify-center rounded-2xl bg-ball text-base font-extrabold text-[#10202b] shadow-lg"
        >
          + Log a game
        </Link>
      </div>
    </section>
  );
}

function KingCard({ view, king }: { view: HillView; king: HillView["rows"][number] }) {
  return (
    <div className="mt-4 rounded-3xl bg-[#0d2536] px-5 pt-6 pb-5 text-white">
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          {king.players.map((p) => (
            <PlayerAvatar key={p.id} id={p.id} name={p.name} crowned size={56} />
          ))}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.12em] text-ball uppercase">King of {view.court.name}</p>
          <p className="mt-1 text-xl leading-tight font-extrabold [&_a]:text-white">
            <Names players={king.players} />
          </p>
          {view.kingSince && (
            <p className="mt-1 text-xs text-white/70">Wearing the crown since {shortDate(view.kingSince)}</p>
          )}
        </div>
      </div>
      <dl className="mt-4 flex gap-6 tabular-nums">
        <Stat label="wins" value={king.wins} />
        <Stat label="losses" value={king.losses} />
        <Stat label="point diff" value={signed(king.pointDiff)} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-white/70">{label}</dt>
      <dd className="text-2xl font-extrabold">{value}</dd>
    </div>
  );
}

function Board({ view }: { view: HillView }) {
  if (view.rows.length === 0) {
    return (
      <div className="mt-2 rounded-2xl border-2 border-dashed border-line p-6 text-center">
        <p className="font-bold">No confirmed {view.format} games here in the last 30 days.</p>
        <p className="mt-1 text-sm text-muted">Log a game to get the board started. The first winner takes the crown.</p>
      </div>
    );
  }

  return (
    <div className="mt-2 overflow-hidden rounded-2xl bg-card">
      <table className="w-full text-left tabular-nums">
        <thead className="text-xs text-muted">
          <tr>
            <th scope="col" className="w-10 py-2 pl-4 font-semibold">
              <span className="sr-only">Rank</span>#
            </th>
            <th scope="col" className="py-2 font-semibold">
              {view.format === "doubles" ? "Team" : "Player"}
            </th>
            <th scope="col" className="w-10 py-2 text-right font-semibold" title="Wins">
              W
            </th>
            <th scope="col" className="w-10 py-2 text-right font-semibold" title="Losses">
              L
            </th>
            <th scope="col" className="w-16 py-2 pr-4 text-right font-semibold" title="Point difference">
              +/−
            </th>
          </tr>
        </thead>
        <tbody>
          {view.rows.map((row) => (
            <tr key={row.players.map((p) => p.id).join("+")} className="border-t border-line">
              <td className="py-3 pl-4 font-extrabold text-muted">{row.rank}</td>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 pt-1">
                    {row.players.map((p) => (
                      <PlayerAvatar key={p.id} id={p.id} name={p.name} crowned={row.isKing} size={34} />
                    ))}
                  </div>
                  <span className="min-w-0 text-[15px] leading-snug">
                    <Names players={row.players} />
                  </span>
                </div>
              </td>
              <td className="py-3 text-right text-lg font-extrabold">{row.wins}</td>
              <td className="py-3 text-right text-muted">{row.losses}</td>
              <td className="py-3 pr-4 text-right font-semibold">{signed(row.pointDiff)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CourtRegular({ view }: { view: HillView }) {
  if (!view.regular) return null;
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
      <span aria-hidden className="grid size-10 flex-none place-items-center rounded-xl bg-mint text-xl">
        📍
      </span>
      <p className="text-sm">
        <b className="block">Court Regular</b>
        <Names players={view.regular.players} /> · {view.regular.games} game{view.regular.games === 1 ? "" : "s"} here in the
        last 30 days
      </p>
    </div>
  );
}

export function Names({ players }: { players: PlayerChip[] }) {
  return players.map((p, i) => (
    <span key={p.id}>
      {i > 0 && " & "}
      <PlayerName id={p.id} name={p.name} flame={p.flame} />
    </span>
  ));
}
