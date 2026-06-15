import { parse } from "exifr";

export type Coords = { lat: number; lng: number };

/**
 * Reads GPS coordinates embedded in a photo's EXIF metadata.
 * Returns the coordinates, or null if the photo has no location data
 * (e.g. the user disabled camera location, or the photo was sent via
 * WhatsApp, which strips EXIF). In that case the caller falls back to
 * device GPS, then to a manual map pin.
 */
export async function extractGpsFromPhoto(file: File): Promise<Coords | null> {
  try {
    const exif = await parse(file, { gps: true });
    if (exif?.latitude != null && exif?.longitude != null) {
      return { lat: exif.latitude, lng: exif.longitude };
    }
  } catch {
    // No or unreadable EXIF — treat as "no location found".
  }
  return null;
}
