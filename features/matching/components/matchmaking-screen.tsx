import { FeaturePlaceholder } from "@/components/feature-placeholder";

// Matchmaking starts here. This is what /players shows.
// Replace the placeholder below with the real screen; keep pieces that only
// this feature uses in this components/ folder.
export function MatchmakingScreen() {
  return (
    <FeaturePlaceholder
      title="Matchmaking"
      summary="Find players at your level who play the way you do and are open to a game."
      entryFile="features/matching/components/matchmaking-screen.tsx"
      readme="features/matching/README.md"
      scope={[
        "Matching matrix: score how well two players fit, using profile fields",
        "Browse players like you, with filters for level, play style and so on",
        "See who is open to play and reach out to them",
      ]}
    />
  );
}
