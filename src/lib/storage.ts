import "server-only";
import { createAdminClient } from "./supabase-admin";

const BUCKET = "report-photos";

/**
 * Uploads a photo to Supabase Storage and returns its public URL.
 *
 * Server-only: used inside API routes after validation. Photos are public
 * (PRD §5.4 — reporters are told photos are publicly accessible).
 *
 * @param path  storage path, e.g. `reports/${groupId}/${Date.now()}.jpg`
 * @param body  the (already compressed) image bytes
 */
export async function uploadPhoto(
  path: string,
  body: ArrayBuffer | Buffer | Blob,
  contentType = "image/jpeg",
): Promise<string> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType,
    upsert: false,
  });
  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
