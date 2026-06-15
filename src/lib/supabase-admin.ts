import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client (SERVER ONLY).
 *
 * Uses the SERVICE ROLE key, which BYPASSES Row Level Security. This is the
 * trusted client used inside API routes (src/app/api/**) for writes such as
 * creating reports, after the route has validated, geo-fenced, and rate-limited
 * the request.
 *
 * The `import "server-only"` line above makes the build FAIL if this file is
 * ever imported into client-side code — so the service-role key can never be
 * shipped to the browser.
 *
 * Created as a function (not a top-level constant) so the service key is only
 * read at request time, on the server.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (local) and to Vercel env vars (production).",
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
