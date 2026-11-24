import Link from "next/link";
import { Suspense } from "react";
import { getViewerId } from "@/shared/auth/test-player";
import { getCourts, getPlayers } from "../data";
import { LogGameForm } from "./log-game-form";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// /hill/log: record a game so it can be confirmed and count on the board.
export function LogGameScreen({ searchParams }: { searchParams: SearchParams }) {
  return (
    <section aria-labelledby="log-title" className="mx-auto max-w-lg">
      <Link href="/hill" className="text-sm font-semibold text-muted hover:text-ink">
        ← Back to the board
      </Link>
      <h1 id="log-title" className="mt-2 text-3xl font-extrabold tracking-tight">
        Log a game
      </h1>
      <Suspense fallback={<p className="mt-6 text-muted">Loading…</p>}>
        <Form searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Form({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [viewerId, players, courts] = await Promise.all([getViewerId(), getPlayers(), getCourts()]);
  const others = players.filter((p) => p.id !== viewerId).map((p) => ({ id: p.id, name: p.name }));
  const courtId = typeof params.court === "string" && courts.some((c) => c.id === params.court) ? params.court : courts[0].id;

  return (
    <LogGameForm
      courts={courts.map((c) => ({ id: c.id, name: c.name }))}
      players={others}
      initialCourtId={courtId}
      initialFormat={params.mode === "doubles" ? "doubles" : "singles"}
    />
  );
}
