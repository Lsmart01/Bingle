// TESTING ONLY: stands in for sign-in until Supabase auth is connected.
// The "Playing as" menu in the app header sets this cookie, so you can log a
// game as one sample player and then confirm it as their opponent.
// Replace getViewerId() with the signed-in user's id once auth exists.

import { cookies } from "next/headers";
import { getPlayers } from "@/features/king-of-the-hill/data";

export const TEST_PLAYER_COOKIE = "bink_test_player";

/** The id of the player using the app right now. */
export async function getViewerId(): Promise<string> {
  const chosen = (await cookies()).get(TEST_PLAYER_COOKIE)?.value;
  const players = await getPlayers();
  return players.find((p) => p.id === chosen)?.id ?? players[0].id;
}
