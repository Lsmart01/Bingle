"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getViewerId } from "@/shared/auth/test-player";
import { logGame, respondToGame } from "./data";

export type LogGameState = { error: string | null };

export async function logGameAction(_prev: LogGameState, formData: FormData): Promise<LogGameState> {
  // Who's logging comes from the session, never from the form.
  const loggedBy = await getViewerId();
  const format = formData.get("format") === "doubles" ? "doubles" : "singles";
  const courtId = String(formData.get("courtId") ?? "");
  const opponentIds = (format === "doubles" ? ["opponent1", "opponent2"] : ["opponent1"]).map((f) =>
    String(formData.get(f) ?? ""),
  );
  const result = formData.get("result");
  const ourScore = formData.get("ourScore");
  const theirScore = formData.get("theirScore");

  if (result !== "win" && result !== "loss") return { error: "Pick Win or Loss." };
  if (ourScore === "" || theirScore === "" || ourScore === null || theirScore === null) {
    return { error: "Enter both scores." };
  }

  const error = await logGame({
    loggedBy,
    courtId,
    format,
    partnerId: format === "doubles" ? String(formData.get("partnerId") ?? "") || null : null,
    opponentIds,
    result,
    ourScore: Number(ourScore),
    theirScore: Number(theirScore),
  });
  if (error) return { error };

  redirect(`/hill?court=${encodeURIComponent(courtId)}&mode=${format}&logged=1`);
}

export async function respondAction(formData: FormData) {
  const playerId = await getViewerId();
  const response = formData.get("response") === "dispute" ? "dispute" : "confirm";
  await respondToGame(String(formData.get("gameId") ?? ""), playerId, response);
  refresh();
}
