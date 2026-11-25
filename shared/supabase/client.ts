import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Creates a Supabase client from the project's public settings. Set these in
// .env.local (see supabase/README.md):
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY   (the "anon" or "publishable" key)
// Both are safe to expose to browsers; the database's access rules do the
// protecting. Never put the service_role key in a NEXT_PUBLIC_ variable.
export function createBinkClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  return createClient(url, key);
}
