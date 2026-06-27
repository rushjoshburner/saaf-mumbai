import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/report/upvote
 *
 * Body (JSON):
 *   { "type": "issue", "groupId": "..." }            — "I See This Too"
 *   { "type": "resolution", "resolutionId": "..." }  — "Looks Fixed"
 *
 * One vote per person for resolutions (enforced by the DB unique constraint);
 * issue upvotes are deduped client-side + by the rate limit.
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!(await checkRateLimit(ip, "upvote"))) {
    return NextResponse.json(
      { error: "Too many votes from this network. Please try again later." },
      { status: 429 },
    );
  }

  let body: { type?: string; groupId?: string; resolutionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (body.type === "issue") {
    if (!body.groupId) {
      return NextResponse.json({ error: "groupId is required." }, { status: 400 });
    }
    const { data: count, error } = await supabase.rpc("increment_issue_upvote", {
      p_group_id: body.groupId,
    });
    if (error) {
      console.error("issue upvote failed:", error.message);
      return NextResponse.json({ error: "Could not record the vote." }, { status: 500 });
    }
    if (count === null) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }
    return NextResponse.json({ count });
  }

  if (body.type === "resolution") {
    if (!body.resolutionId) {
      return NextResponse.json({ error: "resolutionId is required." }, { status: 400 });
    }
    const { data: status, error } = await supabase.rpc("cast_resolution_upvote", {
      p_resolution_id: body.resolutionId,
      p_voter_hash: hashIp(ip),
    });
    if (error) {
      console.error("resolution upvote failed:", error.message);
      return NextResponse.json({ error: "Could not record the vote." }, { status: 500 });
    }
    if (status === "duplicate") {
      return NextResponse.json({ error: "You have already voted on this." }, { status: 409 });
    }
    if (status === "not_found") {
      return NextResponse.json({ error: "Resolution not found." }, { status: 404 });
    }
    // "counted" or "resolved"
    return NextResponse.json({ status });
  }

  return NextResponse.json(
    { error: "type must be 'issue' or 'resolution'." },
    { status: 400 },
  );
}
