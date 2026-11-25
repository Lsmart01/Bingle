import type { Metadata } from "next";
import { Site } from "./_components/site";

export const metadata: Metadata = {
  title: "Bink: Victoria's pickleball community",
  description:
    "More than a game. Find pickleball players at your level in Victoria, BC, and join drop-ins, clinics, socials and tournaments.",
};

// The whole website is one screen. The toolbar switches between views
// (Home, Events, Find players, About us, FAQ, Join) without scrolling.
export default function HomePage() {
  return <Site />;
}
