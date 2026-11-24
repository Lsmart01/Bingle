import type { SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "vitest";
import { BinkError, call, type RpcClient } from "./rpc";

// Compile-time check (npm run typecheck): a real Supabase client can be passed
// to every data function.
export const supabaseClientIsAnRpcClient = (c: SupabaseClient): RpcClient => c;

test("call() returns data, or throws a BinkError with the database's message", async () => {
  const ok: RpcClient = { rpc: async () => ({ data: 42, error: null }) };
  const bad: RpcClient = { rpc: async () => ({ data: null, error: { message: "This game is full.", code: "23514" } }) };
  expect(await call(ok, "x")).toBe(42);
  await expect(call(bad, "x")).rejects.toThrow(BinkError);
  await expect(call(bad, "x")).rejects.toThrow("This game is full.");
});
