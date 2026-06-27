import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/report-card        — the most recent weekly report card
 * GET /api/report-card?week=ISO_DATE — the card for a specific week_start
 */
export async function GET(request: NextRequest) {
  const week = request.nextUrl.searchParams.get("week");

  let query = supabase.from("weekly_report_cards").select("*");
  query = week
    ? query.eq("week_start", week)
    : query.order("week_start", { ascending: false }).limit(1);

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error("report card fetch failed:", error.message);
    return NextResponse.json({ error: "Could not load the report card." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "No report card available yet." }, { status: 404 });
  }

  return NextResponse.json(data);
}
