// Every Bink read and write is a database function, called the way
// supabase-js does: client.rpc("function_name", { p_arg: value }).
// Data functions take anything with that rpc() method, so they work with a
// browser client, a server client, or the in-memory test database.

export type RpcError = { message: string; code?: string };
export type RpcResult = { data: unknown; error: RpcError | null };

export type RpcClient = {
  rpc(fn: string, args?: Record<string, unknown>): PromiseLike<RpcResult>;
};

/** Thrown when a database function refuses or fails. `message` is written for players. */
export class BinkError extends Error {
  readonly code?: string;
  constructor(error: RpcError) {
    super(error.message);
    this.name = "BinkError";
    this.code = error.code;
  }
}

/** Call a database function and return its data, throwing a BinkError on failure. */
export async function call<T>(client: RpcClient, fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await client.rpc(fn, args);
  if (error) throw new BinkError(error);
  return data as T;
}
