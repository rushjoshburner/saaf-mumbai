import imageCompression from "browser-image-compression";

/**
 * Compresses a photo in the browser before upload, to keep storage small
 * and uploads fast on mobile networks. Targets max 800KB and 1200px on the
 * longest side (per the TRD). EXIF is preserved so GPS extraction still works
 * if it runs after compression.
 */
export async function compressPhoto(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    preserveExif: true,
  });
}
