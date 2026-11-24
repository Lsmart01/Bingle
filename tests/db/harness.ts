// Runs Bink's real Supabase migrations in PGlite (Postgres compiled to
// WebAssembly, running in-process) so the schema, access rules and functions
// can be tested without Docker or a Supabase project.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { RpcClient, RpcResult } from "@/shared/supabase/rpc";

const root = join(__dirname, "..", "..");
const migrationsDir = join(root, "supabase", "migrations");

export type TestDb = {
  pg: PGlite;
  /** A client that calls database functions the way supabase-js does, as this user. */
  as(userId: string | null): TestClient;
  close(): Promise<void>;
};

export type TestClient = RpcClient & {
  /** Run raw SQL as this user (role and JWT set as Supabase would). */
  sql<T = Record<string, unknown>>(query: string, params?: unknown[]): Promise<T[]>;
};

export async function createTestDb(options: { seed?: boolean } = {}): Promise<TestDb> {
  const pg = new PGlite();
  await pg.exec(readFileSync(join(__dirname, "supabase-stubs.sql"), "utf8"));
  for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()) {
    try {
      await pg.exec(readFileSync(join(migrationsDir, file), "utf8"));
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
    }
  }
  if (options.seed) {
    await pg.exec(readFileSync(join(root, "supabase", "seed.sql"), "utf8"));
  }

  return {
    pg,
    as: (userId) => clientFor(pg, userId),
    close: () => pg.close(),
  };
}

function clientFor(pg: PGlite, userId: string | null): TestClient {
  const role = userId ? "authenticated" : "anon";
  const claims = JSON.stringify(userId ? { sub: userId, role } : { role });

  async function run<T>(query: string, params: unknown[]): Promise<T[]> {
    return pg.transaction(async (tx) => {
      await tx.query(`select set_config('request.jwt.claims', $1, true)`, [claims]);
      await tx.exec(`set local role ${role}`);
      const result = await tx.query<T>(query, params);
      return result.rows;
    });
  }

  return {
    sql: (query, params = []) => run(query, params),

    // supabase.rpc(fn, { p_arg: value }) calls public.fn(p_arg => value).
    async rpc(fn: string, args: Record<string, unknown> = {}): Promise<RpcResult> {
      if (!/^[a-z_]+$/.test(fn)) throw new Error(`Bad function name: ${fn}`);
      const names = Object.keys(args);
      for (const name of names) if (!/^[a-z_]+$/.test(name)) throw new Error(`Bad argument name: ${name}`);
      const call = `public.${fn}(${names.map((n, i) => `${n} => $${i + 1}`).join(", ")})`;
      const values = names.map((n) => (Array.isArray(args[n]) ? pgArray(args[n] as unknown[]) : args[n]));
      try {
        const rows = await run<{ result: unknown }>(`select to_jsonb(${call}) as result`, values);
        return { data: rows[0]?.result ?? null, error: null };
      } catch (error) {
        const e = error as { message: string; code?: string };
        return { data: null, error: { message: e.message, code: e.code } };
      }
    },
  };
}

/** Make an auth user plus a complete player profile. Runs as the database owner. */
export async function addPlayer(
  db: TestDb,
  player: {
    id: string;
    name?: string;
    birthDate?: string;
    gender?: string | null;
    skill?: number;
    dupr?: number | null;
    style?: "fun" | "social" | "competitive";
    formats?: string[];
    playTimes?: string[];
    openToPlay?: boolean;
    area?: string | null;
    lastActiveDaysAgo?: number;
    prefAgeMin?: number | null;
    prefAgeMax?: number | null;
    prefGender?: string[] | null;
    homeCourtSlug?: string;
    courtSlugs?: string[];
  },
) {
  const p = player;
  await db.pg.query(`insert into auth.users (id, email) values ($1, $2)`, [p.id, `${p.id}@example.test`]);
  await db.pg.query(
    `insert into public.players
       (id, name, photo_url, bio, birth_date, gender, skill, dupr, play_style, formats, play_times,
        open_to_play, area, last_active_at, pref_age_min, pref_age_max, pref_gender)
     values ($1, $2, $16, '', $3, $4, $5, $6, $7, $8::public.play_format[],
             $9::text[], $10, $11, now() - make_interval(days => $12), $13, $14, $15::public.gender[])`,
    [
      p.id,
      p.name ?? `Player ${p.id.slice(-4)}`,
      p.birthDate ?? "1990-06-15",
      p.gender ?? null,
      p.skill ?? 3.5,
      p.dupr ?? null,
      p.style ?? "social",
      pgArray(p.formats ?? ["doubles"]),
      pgArray(p.playTimes ?? []),
      p.openToPlay ?? true,
      p.area ?? null,
      p.lastActiveDaysAgo ?? 0,
      p.prefAgeMin ?? null,
      p.prefAgeMax ?? null,
      p.prefGender ? pgArray(p.prefGender) : null,
      `https://example.test/${p.id}.jpg`,
    ],
  );
  const courts = new Set([...(p.courtSlugs ?? []), ...(p.homeCourtSlug ? [p.homeCourtSlug] : [])]);
  for (const slug of courts) {
    await db.pg.query(
      `insert into public.player_courts (player_id, court_id, is_home)
       select $1, id, $3 from public.courts where slug = $2`,
      [p.id, slug, slug === p.homeCourtSlug],
    );
  }
}

/** Add a court directly (tests that don't load the seed). */
export async function addCourt(db: TestDb, slug: string, area = "Victoria", name = slug) {
  await db.pg.query(
    `insert into public.courts (slug, name, municipality, area, latitude, longitude)
     values ($1, $2, $3, $3, 48.43, -123.36)`,
    [slug, name, area],
  );
}

/**
 * A Postgres array literal, e.g. ["a","b"] → '{"a","b"}'. PostgREST does this
 * for supabase-js; PGlite can't for enum arrays.
 */
function pgArray(values: unknown[]): string {
  return `{${values.map((v) => `"${String(v).replace(/["\\]/g, "\\$&")}"`).join(",")}}`;
}

/** Fixed, readable test ids: uid(1) → 00000000-0000-4000-8000-000000000001 */
export function uid(n: number): string {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}
