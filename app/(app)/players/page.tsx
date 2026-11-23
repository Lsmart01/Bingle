import type { Metadata } from "next";
import { MatchmakingScreen } from "@/features/matching/components/matchmaking-screen";

export const metadata: Metadata = {
  title: "Matchmaking",
};

// /players: the real code lives in features/matching/.
export default function PlayersPage() {
  return <MatchmakingScreen />;
}
