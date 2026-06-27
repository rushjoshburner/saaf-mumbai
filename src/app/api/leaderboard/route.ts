import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const FN: Record<string, string> = {
  mla: "leaderboard_mla",
  mp: "leaderboard_mp",
  ward: "leaderboard_ward",
};

type Row = { oldest_open: string | null; [k: string]: unknown };

/**
 * GET /api/leaderboard?tab=mla|mp|ward — jurisdictions ranked by open report
 * count. Adds a `days_open` field (days since the oldest unresolved report).
 */
export async function GET(request: NextRequest) {
  const tab = request.nextUrl.searchParams.get("tab") ?? "mla";
  const fn = FN[tab];
  if (!fn) {
    return NextResponse.json(
      { error: "tab must be mla, mp, or ward." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.rpc(fn);
  if (error) {
    console.error("leaderboard failed:", error.message);
    return NextResponse.json({ error: "Could not load the leaderboard." }, { status: 500 });
  }

  const now = Date.now();
  const rows = (data as Row[]).map((r) => ({
    ...r,
    days_open: r.oldest_open
      ? Math.floor((now - new Date(r.oldest_open).getTime()) / 86400000)
      : null,
  }));

  return NextResponse.json({ tab, entries: rows });
}
