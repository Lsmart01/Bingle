"use client";

// Submits the "Testing as" form as soon as a different player is picked.
export function TestPlayerSelect({ players, value }: { players: { id: string; name: string }[]; value: string }) {
  return (
    <select
      id="playerId"
      name="playerId"
      key={value}
      defaultValue={value}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="rounded-full border border-line bg-card px-2 py-1 font-semibold"
    >
      {players.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
