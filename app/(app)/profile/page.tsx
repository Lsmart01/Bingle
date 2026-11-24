import type { Metadata } from "next";
import { ProfileScreen } from "@/features/profile/components/profile-screen";

export const metadata: Metadata = {
  title: "Profile",
};

// /profile: the profile of whoever is using the app.
export default function MyProfilePage() {
  return <ProfileScreen />;
}
