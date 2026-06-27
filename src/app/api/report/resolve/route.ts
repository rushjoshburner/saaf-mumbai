import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { uploadPhoto } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * POST /api/report/resolve — submit a "this is fixed" photo for a report group.
 *
 * Body (FormData): groupId, photo. Moves the group to "resolution_submitted"
 * and starts the 72h community-confirmation window.
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!(await checkRateLimit(ip, "resolve"))) {
    return NextResponse.json(
      { error: "Too many resolution photos from this network. Try again later." },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const photo = form.get("photo");
  const groupId = form.get("groupId") ? String(form.get("groupId")) : null;

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "A photo is required." }, { status: 400 });
  }
  if (!groupId) {
    return NextResponse.json({ error: "groupId is required." }, { status: 400 });
  }

  const supabase = createAdminClient();

  let photoUrl: string;
  try {
    const bytes = await photo.arrayBuffer();
    const ext =
      photo.type === "image/png"
        ? "png"
        : photo.type === "image/webp"
          ? "webp"
          : "jpg";
    photoUrl = await uploadPhoto(
      `resolutions/${randomUUID()}.${ext}`,
      bytes,
      photo.type || "image/jpeg",
    );
  } catch (e) {
    console.error("resolution photo upload failed:", e);
    return NextResponse.json(
      { error: "Photo upload failed. Please try again." },
      { status: 500 },
    );
  }

  const { data: resolutionId, error } = await supabase.rpc("submit_resolution", {
    p_group_id: groupId,
    p_photo_url: photoUrl,
    p_submitter_hash: hashIp(ip),
  });
  if (error) {
    console.error("submit_resolution failed:", error.message);
    return NextResponse.json(
      { error: "Could not submit the resolution." },
      { status: 500 },
    );
  }
  if (!resolutionId) {
    return NextResponse.json(
      { error: "This report can't be marked resolved (not found or already resolved)." },
      { status: 422 },
    );
  }

  return NextResponse.json({ resolutionId }, { status: 201 });
}
