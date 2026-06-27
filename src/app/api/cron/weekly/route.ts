import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * GET /api/cron/weekly — runs every Monday 00:01 UTC (see vercel.json).
 * Generates the weekly report card, flags timed-out resolutions for review,
 * and prunes old rate-limit rows. Secured by the CRON_SECRET bearer token,
 * which Vercel sends automatically.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: reportCardId, error: cardErr } = await supabase.rpc(
    "generate_weekly_report_card",
  );
  if (cardErr) {
    console.error("report card generation failed:", cardErr.message);
    return NextResponse.json({ error: "Report card generation failed." }, { status: 500 });
  }

  const { data: flagged, error: flagErr } = await supabase.rpc("flag_stale_resolutions");
  if (flagErr) {
    console.error("flagging stale resolutions failed:", flagErr.message);
  }

  await supabase.rpc("prune_rate_limit_hits");

  return NextResponse.json({
    reportCardId,
    flaggedResolutions: flagged ?? 0,
  });
}
