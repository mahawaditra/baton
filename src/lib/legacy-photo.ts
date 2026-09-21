export const LEGACY_PHOTO_CACHE_CONTROL =
  "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

export function legacyPhotoResponse(buffer: Buffer, contentType: string) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": LEGACY_PHOTO_CACHE_CONTROL,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function legacyPhotoNotFound() {
  return new Response("Not found", { status: 404 });
}
