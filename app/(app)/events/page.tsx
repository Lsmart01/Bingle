import type { Metadata } from "next";
import { LiveMapScreen } from "@/features/events-map/components/live-map-screen";

export const metadata: Metadata = {
  title: "Live map",
};

// /events: the real code lives in features/events-map/.
export default function EventsPage() {
  return <LiveMapScreen />;
}
