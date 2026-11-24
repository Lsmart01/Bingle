"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { getPlayers } from "@/features/king-of-the-hill/data";
import { TEST_PLAYER_COOKIE } from "./test-player";

// TESTING ONLY: switch which sample player you're using the app as.
export async function switchTestPlayer(formData: FormData) {
  const id = String(formData.get("playerId") ?? "");
  const players = await getPlayers();
  if (!players.some((p) => p.id === id)) return;
  (await cookies()).set(TEST_PLAYER_COOKIE, id, { path: "/", sameSite: "lax", httpOnly: true });
  refresh();
}
