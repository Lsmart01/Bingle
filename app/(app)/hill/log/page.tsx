import type { Metadata } from "next";
import { LogGameScreen } from "@/features/king-of-the-hill/components/log-game-screen";

export const metadata: Metadata = {
  title: "Log a game",
};

// /hill/log: the real code lives in features/king-of-the-hill/.
export default function LogGamePage({ searchParams }: PageProps<"/hill/log">) {
  return <LogGameScreen searchParams={searchParams} />;
}
