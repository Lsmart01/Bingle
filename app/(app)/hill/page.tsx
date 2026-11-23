import type { Metadata } from "next";
import { HillScreen } from "@/features/king-of-the-hill/components/hill-screen";

export const metadata: Metadata = {
  title: "King of the hill",
};

// /hill: the real code lives in features/king-of-the-hill/.
export default function HillPage() {
  return <HillScreen />;
}
