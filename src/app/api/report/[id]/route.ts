import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/report/[id] — full detail for one report group: the group, its photo
 * history, and any resolution submission. Read-only via the public client (RLS
 * keeps private fields like raw EXIF out).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("report_groups")
    .select(
      "*, report_photos(photo_url, submitted_at), resolution_submissions(id, photo_url, resolution_upvote_count, submitted_at)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("report fetch failed:", error.message);
    return NextResponse.json({ error: "Could not load the report." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}
