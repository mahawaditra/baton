import { fetchFileBytes } from "@/lib/files/drive";
import { LEGACY_CREW } from "@/lib/legacy/legacy-crew";
import { legacyPhotoNotFound, legacyPhotoResponse } from "@/lib/legacy/legacy-photo";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const member = LEGACY_CREW.find((m) => m.slug === slug);
  if (!member?.photoDriveFileId) return legacyPhotoNotFound();

  const origin = process.env.LEGACY_PHOTO_ORIGIN;
  if (origin) {
    const upstream = await fetch(`${origin}/legacy/photo/crew/${slug}`);
    if (!upstream.ok) return legacyPhotoNotFound();
    return legacyPhotoResponse(
      Buffer.from(await upstream.arrayBuffer()),
      member.mimeType,
    );
  }

  const buffer = await fetchFileBytes(member.photoDriveFileId);
  return legacyPhotoResponse(buffer, member.mimeType);
}
