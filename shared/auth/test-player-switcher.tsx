import { getPlayers } from "@/features/king-of-the-hill/data";
import { switchTestPlayer } from "./actions";
import { TestPlayerSelect } from "./test-player-select";
import { getViewerId } from "./test-player";

// TESTING ONLY: the "Playing as" menu in the app header. Remove once sign-in exists.
export async function TestPlayerSwitcher() {
  const [players, viewerId] = await Promise.all([getPlayers(), getViewerId()]);
  return (
    <form action={switchTestPlayer} className="flex items-center gap-2 rounded-full bg-mint py-1 pr-1 pl-3 text-sm">
      <label htmlFor="playerId" className="font-semibold text-muted">
        Testing as
      </label>
      <TestPlayerSelect players={players.map((p) => ({ id: p.id, name: p.name }))} value={viewerId} />
    </form>
  );
}
