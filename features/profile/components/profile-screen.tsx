import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlayerAvatar } from "@/components/player-avatar";
import { getProfile } from "@/features/king-of-the-hill/data";
import { formatLabel, monthYear, shortDate } from "@/features/king-of-the-hill/format";
import { getViewerId } from "@/shared/auth/test-player";

// A player's profile: for now, their King of the Court crown, badges and crown history.
// Pass a player id, or nothing to show the person using the app.
export function ProfileScreen({ playerId }: { playerId?: Promise<string> }) {
  return (
    <Suspense fallback={<p className="text-muted">Loading profile…</p>}>
      <Profile playerId={playerId} />
    </Suspense>
  );
}

async function Profile({ playerId }: { playerId?: Promise<string> }) {
  // Read the session first: it makes this render at request time, which the
  // 30-day window (based on the current time) needs.
  const viewerId = await getViewerId();
  const id = playerId ? await playerId : viewerId;
  const profile = await getProfile(id);
  if (!profile) notFound();
  const { player } = profile;

  return (
    <section aria-labelledby="player-name" className="mx-auto max-w-lg">
      <div className="flex items-end gap-4 pt-6">
        <PlayerAvatar id={player.id} name={player.name} crowned={profile.crowned} size={88} />
        <div className="min-w-0 pb-1">
          <h1 id="player-name" className="text-3xl leading-tight font-extrabold tracking-tight">
            {player.name}
            {profile.flame && (
              <span role="img" aria-label="On a win streak" className="ml-2">
                🔥
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {player.id === viewerId ? "This is you. " : ""}
            {profile.streak > 0
              ? `${profile.streak} confirmed win${profile.streak === 1 ? "" : "s"} in a row`
              : "No current win streak"}
          </p>
        </div>
      </div>

      {(profile.currentCrowns.length > 0 || profile.regularAt.length > 0) && (
        <ul className="mt-6 space-y-2">
          {profile.currentCrowns.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-[#0d2536] px-4 py-3 text-white">
              <span aria-hidden className="grid size-10 flex-none place-items-center rounded-xl bg-ball text-xl">
                👑
              </span>
              <div>
                <b className="block">King of {c.courtName}</b>
                <small className="text-white/70">
                  {formatLabel(c.format)} · since {shortDate(c.startedAt)}
                </small>
              </div>
            </li>
          ))}
          {profile.regularAt.map((r) => (
            <li key={r.courtName} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
              <span aria-hidden className="grid size-10 flex-none place-items-center rounded-xl bg-mint text-xl">
                📍
              </span>
              <div>
                <b className="block">Court Regular at {r.courtName}</b>
                <small className="text-muted">
                  {r.games} game{r.games === 1 ? "" : "s"} there in the last 30 days
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-lg font-extrabold">Crown history</h2>
      {profile.pastCrowns.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No past crowns yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line rounded-2xl bg-card px-4">
          {profile.pastCrowns.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <span aria-hidden className="text-lg opacity-70">
                👑
              </span>
              <div>
                <b className="block text-sm">
                  King of {c.courtName}, {monthYear(c.startedAt)}
                </b>
                <small className="text-muted">
                  {formatLabel(c.format)} · {shortDate(c.startedAt)} to {shortDate(c.endedAt!)}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
