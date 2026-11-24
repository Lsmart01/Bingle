"use client";

import { useActionState, useState } from "react";
import { logGameAction, type LogGameState } from "../actions";
import { checkScore } from "../logic";
import type { Format } from "../types";

type Option = { id: string; name: string };

type Props = {
  courts: Option[];
  /** Everyone except the person logging. */
  players: Option[];
  initialCourtId: string;
  initialFormat: Format;
};

const field = "mt-1.5 block w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base";
const label = "block text-sm font-bold text-muted";

export function LogGameForm({ courts, players, initialCourtId, initialFormat }: Props) {
  const [state, formAction, pending] = useActionState<LogGameState, FormData>(logGameAction, { error: null });
  const [format, setFormat] = useState<Format>(initialFormat);
  const [picks, setPicks] = useState({ partnerId: "", opponent1: "", opponent2: "" });
  const [result, setResult] = useState<"win" | "loss" | "">("");
  const [ours, setOurs] = useState("");
  const [theirs, setTheirs] = useState("");

  const doubles = format === "doubles";
  const slots = doubles ? (["partnerId", "opponent1", "opponent2"] as const) : (["opponent1"] as const);

  // Each player can only be picked once, so hide anyone already chosen in another slot.
  const optionsFor = (slot: keyof typeof picks) =>
    players.filter((p) => !slots.some((s) => s !== slot && picks[s] === p.id));

  const hint = scoreHint(result, ours, theirs);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <div>
        <label htmlFor="courtId" className={label}>
          Court
        </label>
        <select id="courtId" name="courtId" defaultValue={initialCourtId} className={field} required>
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={label}>Game type</legend>
        <Segmented
          name="format"
          value={format}
          onChange={(v) => setFormat(v as Format)}
          options={[
            ["singles", "Singles"],
            ["doubles", "Doubles"],
          ]}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="sr-only">Players</legend>
        {doubles && (
          <PlayerSelect
            label="Your partner"
            name="partnerId"
            value={picks.partnerId}
            options={optionsFor("partnerId")}
            onChange={(v) => setPicks({ ...picks, partnerId: v })}
          />
        )}
        <PlayerSelect
          label={doubles ? "Opponent 1" : "Your opponent"}
          name="opponent1"
          value={picks.opponent1}
          options={optionsFor("opponent1")}
          onChange={(v) => setPicks({ ...picks, opponent1: v })}
        />
        {doubles && (
          <PlayerSelect
            label="Opponent 2"
            name="opponent2"
            value={picks.opponent2}
            options={optionsFor("opponent2")}
            onChange={(v) => setPicks({ ...picks, opponent2: v })}
          />
        )}
      </fieldset>

      <fieldset>
        <legend className={label}>Score</legend>
        <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <ScoreInput id="ourScore" label={doubles ? "Your team" : "You"} value={ours} onChange={setOurs} />
          <span aria-hidden className="pb-3 text-2xl font-bold text-muted">
            –
          </span>
          <ScoreInput id="theirScore" label="Them" value={theirs} onChange={setTheirs} />
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>Result</legend>
        <Segmented
          name="result"
          value={result}
          onChange={(v) => setResult(v as "win" | "loss")}
          options={[
            ["win", "Win"],
            ["loss", "Loss"],
          ]}
        />
      </fieldset>

      {hint && (
        <p
          aria-live="polite"
          className={`rounded-xl px-4 py-3 text-sm ${hint.ok ? "bg-mint" : "bg-[#fdecea] text-[#8a1f11]"}`}
        >
          {hint.text}
        </p>
      )}

      {state.error && (
        <p role="alert" className="rounded-xl bg-[#fdecea] px-4 py-3 text-sm font-semibold text-[#8a1f11]">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="h-13 w-full rounded-2xl bg-ink text-base font-extrabold text-card disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send for confirmation"}
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          It shows as &ldquo;Waiting for confirmation&rdquo; until the other side confirms it. Only confirmed games count.
        </p>
      </div>
    </form>
  );
}

/** Live feedback on the score as it's typed, using the same rule the server checks. */
function scoreHint(result: string, ours: string, theirs: string): { ok: boolean; text: string } | null {
  if (ours === "" || theirs === "") return null;
  const a = Number(ours);
  const b = Number(theirs);
  const winning = Math.max(a, b);
  const losing = Math.min(a, b);
  const problem = checkScore(winning, losing);
  if (problem) return { ok: false, text: problem };
  if (result === "win" && a < b) return { ok: false, text: "You picked Win, but your score is lower." };
  if (result === "loss" && a > b) return { ok: false, text: "You picked Loss, but your score is higher." };
  if (!result) return { ok: true, text: `${a}–${b} is a valid score. Now pick Win or Loss.` };
  return { ok: true, text: `${result === "win" ? "Win" : "Loss"}, ${a}–${b}. Looks good.` };
}

function Segmented({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="mt-1.5 flex rounded-xl bg-line/60 p-1">
      {options.map(([v, text]) => (
        <label
          key={v}
          className="flex-1 cursor-pointer rounded-lg py-2 text-center font-bold text-muted has-checked:bg-card has-checked:text-ink has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-teal"
        >
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="sr-only"
            required
          />
          {text}
        </label>
      ))}
    </div>
  );
}

function PlayerSelect({
  label: text,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className={label}>
        {text}
      </label>
      <select id={name} name={name} value={value} onChange={(e) => onChange(e.target.value)} className={field} required>
        <option value="" disabled>
          Pick a player
        </option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScoreInput({
  id,
  label: text,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="text-center">
      <label htmlFor={id} className="text-sm font-semibold">
        {text}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={99}
        step={1}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-xl border border-line bg-card py-2 text-center text-4xl font-extrabold tabular-nums"
      />
    </div>
  );
}
