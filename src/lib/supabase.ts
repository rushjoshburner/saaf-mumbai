import { createClient } from "@supabase/supabase-js";

/**
 * Public Supabase client.
 *
 * Uses the PUBLIC anon key, so it is safe to use anywhere — client components,
 * server components, or API routes that only need to READ public data.
 * Row Level Security (see supabase/migrations) restricts this client to the
 * public, read-only data only.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
