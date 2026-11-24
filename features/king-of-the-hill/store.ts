// Local stand-in for Supabase: keeps players, courts, games and crowns in a
// JSON file at .data/bink-local.json (git-ignored). Server only.
//
// When Supabase is connected, replace the bodies of readDb/writeDb's callers in
// data.ts with queries against the tables in supabase/migrations/. The data
// shapes are the same, so nothing above data.ts has to change.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Court, Crown, Game, Player } from "./types";

export type Db = {
  players: Player[];
  courts: Court[];
  games: Game[];
  crowns: Crown[];
};

const FILE = path.join(process.cwd(), ".data", "bink-local.json");

// Test players and courts so the feature can be tried before sign-up exists.
// Every one is labelled "(sample)" and flagged isSample. No games or stats are
// seeded: boards start empty and only fill with games you log yourself.
function seed(): Db {
  const players: Player[] = ["Alex", "Blair", "Casey", "Drew", "Emery", "Finley"].map((name) => ({
    id: `sample-${name.toLowerCase()}`,
    name: `${name} (sample)`,
    isSample: true,
  }));
  const courts: Court[] = ["Fernwood", "Oak Bay", "Topaz"].map((name) => ({
    id: `sample-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name: `${name} (sample)`,
    isSample: true,
  }));
  return { players, courts, games: [], crowns: [] };
}

// Several reads can start at once on the first visit; they share one seeding.
let seeding: Promise<void> | null = null;

export async function readDb(): Promise<Db> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Db;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    seeding ??= save(seed()).finally(() => (seeding = null));
    await seeding;
    return JSON.parse(await readFile(FILE, "utf8")) as Db;
  }
}

async function save(db: Db) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${crypto.randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(db, null, 2));
  await rename(tmp, FILE);
}

// Writes run one at a time so two quick taps can't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();

/** Reads the data, lets `change` edit it, then saves. Returns what `change` returns. */
export function updateDb<T>(change: (db: Db) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = change(db);
    await save(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}
