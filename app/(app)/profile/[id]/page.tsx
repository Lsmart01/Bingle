import type { Metadata } from "next";
import { ProfileScreen } from "@/features/profile/components/profile-screen";

export const metadata: Metadata = {
  title: "Profile",
};

// /profile/[id]: another player's profile.
export default function PlayerProfilePage({ params }: PageProps<"/profile/[id]">) {
  return <ProfileScreen playerId={params.then((p) => p.id)} />;
}
