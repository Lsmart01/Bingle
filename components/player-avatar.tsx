// A player's profile photo, with a crown on top when they're King of a court.
// Players don't have photos yet, so this shows their initial on a colour
// picked from their id.

const COLOURS = ["#173f5c", "#1f8a83", "#5b6abf", "#b5562f", "#7a4f9a", "#2f7a3f"];

function colourFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLOURS[hash % COLOURS.length];
}

type Props = { id: string; name: string; crowned?: boolean; size?: number };

export function PlayerAvatar({ id, name, crowned = false, size = 40 }: Props) {
  return (
    <span className="relative inline-block flex-none" style={{ width: size, height: size }}>
      <span
        aria-hidden
        className="grid size-full place-items-center rounded-full font-extrabold text-white"
        style={{
          background: colourFor(id),
          fontSize: size * 0.42,
          boxShadow: crowned ? "0 0 0 3px var(--card), 0 0 0 5px #f5c518" : undefined,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
      {crowned && (
        <span
          role="img"
          aria-label="Crown"
          className="absolute left-1/2 -translate-x-1/2 -rotate-12 leading-none drop-shadow"
          style={{ top: -size * 0.42, fontSize: size * 0.5 }}
        >
          👑
        </span>
      )}
    </span>
  );
}
