import { prisma } from "@/lib/prisma";
import { drive, fetchFileBytes } from "@/lib/drive";
import { legacyPhotoNotFound, legacyPhotoResponse } from "@/lib/legacy-photo";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SERVABLE_TYPES = ["image/jpeg", "image/png"];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return legacyPhotoNotFound();

  const tombstone = await prisma.tombstone.findUnique({
    where: { id },
    select: { photoDriveFileId: true },
  });
  if (!tombstone?.photoDriveFileId) return legacyPhotoNotFound();

  const fileId = tombstone.photoDriveFileId;
  const [meta, buffer] = await Promise.all([
    drive.files.get({ fileId, fields: "mimeType" }),
    fetchFileBytes(fileId),
  ]);

  const driveMimeType = meta.data.mimeType ?? "";
  if (!SERVABLE_TYPES.includes(driveMimeType)) return legacyPhotoNotFound();

  return legacyPhotoResponse(buffer, driveMimeType);
}
