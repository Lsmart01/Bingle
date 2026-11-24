import Link from "next/link";

// A player's name linking to their profile, with 🔥 when they're on a streak
// of 3 or more confirmed wins.
export function PlayerName({ id, name, flame }: { id: string; name: string; flame: boolean }) {
  return (
    <Link href={`/profile/${id}`} className="font-bold hover:underline">
      {name}
      {flame && (
        <span role="img" aria-label="On a win streak" title="3+ wins in a row" className="ml-1">
          🔥
        </span>
      )}
    </Link>
  );
}
