import { FeaturePlaceholder } from "@/components/feature-placeholder";

// The live map starts here. This is what /events shows.
// Replace the placeholder below with the real screen; keep pieces that only
// this feature uses in this components/ folder.
export function LiveMapScreen() {
  return (
    <FeaturePlaceholder
      title="Live map"
      summary="A live map of pickleball around Victoria: tournaments, drop-ins, clinics and social nights."
      entryFile="features/events-map/components/live-map-screen.tsx"
      readme="features/events-map/README.md"
      scope={[
        "Map with pins for upcoming events near the player",
        "Event details: what it is, where, when, skill level and host",
        "List view of the same events, for players who'd rather scroll than pan a map",
      ]}
    />
  );
}
