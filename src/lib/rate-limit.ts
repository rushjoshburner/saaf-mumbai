import "server-only";
import { createHash } from "crypto";
import { createAdminClient } from "./supabase-admin";

/**
 * Turns an IP address into a salted one-way hash. We never store raw IPs
 * (PRD §5.4 — reports are anonymous). The same hash is used both for rate
 * limiting and for "one vote per person" dedup (DECISIONS.md D-001).
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(salt + ip).digest("hex");
}

export type RateAction = "report" | "resolve" | "upvote";

// Per-IP-per-hour limits (TRD §6).
const LIMITS: Record<RateAction, { limit: number; windowSeconds: number }> = {
  report: { limit: 5, windowSeconds: 3600 },
  resolve: { limit: 3, windowSeconds: 3600 },
  upvote: { limit: 10, windowSeconds: 3600 },
};

/**
 * Checks (and records) a request against the per-IP rate limit, using the
 * `check_rate_limit` Postgres function. Returns true if allowed, false if the
 * caller has hit the limit for this action.
 *
 * Implemented in Supabase Postgres instead of Vercel KV (DECISIONS.md D-005) —
 * one fewer service, no extra account, fine at community-tool scale.
 */
export async function checkRateLimit(
  ip: string,
  action: RateAction,
): Promise<boolean> {
  const { limit, windowSeconds } = LIMITS[action];
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_action: action,
    p_ident: hashIp(ip),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    // Fail closed: if the limiter itself errors, block the write rather than
    // risk an unthrottled flood.
    console.error("rate limit check failed:", error.message);
    return false;
  }

  return data === true;
}
