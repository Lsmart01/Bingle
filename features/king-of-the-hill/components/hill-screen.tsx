import { FeaturePlaceholder } from "@/components/feature-placeholder";

// King of the hill starts here. This is what /hill shows.
// Replace the placeholder below with the real screen; keep pieces that only
// this feature uses in this components/ folder.
export function HillScreen() {
  return (
    <FeaturePlaceholder
      title="King of the hill"
      summary="A ranked ladder of players on win streaks, and the chance to challenge them for the top spot."
      entryFile="features/king-of-the-hill/components/hill-screen.tsx"
      readme="features/king-of-the-hill/README.md"
      scope={[
        "Ranked leaderboard of current win streaks",
        "Challenge a player who's on a streak",
        "Record match results so streaks and rankings update",
      ]}
    />
  );
}
