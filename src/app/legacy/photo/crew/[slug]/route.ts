import { fetchFileBytes } from "@/lib/drive";
import { LEGACY_CREW } from "@/lib/legacy-crew";
import { legacyPhotoNotFound, legacyPhotoResponse } from "@/lib/legacy-photo";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const member = LEGACY_CREW.find((m) => m.slug === slug);
  if (!member?.photoDriveFileId) return legacyPhotoNotFound();

  const buffer = await fetchFileBytes(member.photoDriveFileId);
  return legacyPhotoResponse(buffer, member.mimeType);
}
