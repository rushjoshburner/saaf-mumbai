import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { uploadPhoto } from "@/lib/storage";

export const runtime = "nodejs";

const TABS = new Set(["garbage", "monsoon"]);

/**
 * POST /api/report — submit a new civic issue report.
 *
 * Order matters: rate-limit (cheap reject) → validate → geo-fence (hard gate)
 * → reverse-geocode → upload photo → save. The photo is only uploaded once the
 * report is known to be valid and inside Mumbai, so we never store junk.
 */
export async function POST(request: NextRequest) {
  // 1. Identify the caller and rate-limit (5 reports / IP / hour).
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!(await checkRateLimit(ip, "report"))) {
    return NextResponse.json(
      { error: "Too many reports from this network. Please try again later." },
      { status: 429 },
    );
  }

  // 2. Parse the multipart form.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const photo = form.get("photo");
  const tab = String(form.get("tab") ?? "");
  const subIssue = form.get("subIssue") ? String(form.get("subIssue")) : null;
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  const exifLat = form.get("exifLat") != null ? Number(form.get("exifLat")) : null;
  const exifLng = form.get("exifLng") != null ? Number(form.get("exifLng")) : null;

  // 3. Validate inputs.
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "A photo is required." }, { status: 400 });
  }
  if (!TABS.has(tab)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "A valid location is required." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  // 4. Server-side geo-fence — the hard gate that cannot be bypassed.
  const { data: inside, error: fenceErr } = await supabase.rpc("is_within_bmc", {
    lat,
    lng,
  });
  if (fenceErr) {
    console.error("geo-fence check failed:", fenceErr.message);
    return NextResponse.json(
      { error: "Could not verify the location." },
      { status: 500 },
    );
  }
  if (!inside) {
    return NextResponse.json(
      { error: "Reports can only be filed inside Mumbai." },
      { status: 422 },
    );
  }

  // 5. Reverse-geocode into ward / MLA / MP (nulls are fine — shown as "Unknown").
  const { data: geo } = await supabase.rpc("reverse_geocode", { lat, lng });
  const place = Array.isArray(geo) ? geo[0] : geo;
  const wardCode = place?.ward_code ?? null;
  const mlaId = place?.mla_id ?? null;
  const mpId = place?.mp_id ?? null;

  // 6. Upload the (already client-compressed) photo to Supabase Storage.
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
      `reports/${randomUUID()}.${ext}`,
      bytes,
      photo.type || "image/jpeg",
    );
  } catch (e) {
    console.error("photo upload failed:", e);
    return NextResponse.json(
      { error: "Photo upload failed. Please try again." },
      { status: 500 },
    );
  }

  // 7. Create or join a report group (atomic, server-side).
  const { data: groupId, error: writeErr } = await supabase.rpc("submit_report", {
    p_tab: tab,
    p_sub_issue: subIssue,
    p_lat: lat,
    p_lng: lng,
    p_ward_code: wardCode,
    p_mla_id: mlaId,
    p_mp_id: mpId,
    p_photo_url: photoUrl,
    p_exif_lat: exifLat,
    p_exif_lng: exifLng,
  });
  if (writeErr) {
    console.error("submit_report failed:", writeErr.message);
    return NextResponse.json(
      { error: "Could not save the report." },
      { status: 500 },
    );
  }

  return NextResponse.json({ reportId: groupId }, { status: 201 });
}
