import { drive, fetchFileBytes } from "@/lib/files/drive";
import { ALLOWED_UPLOAD_MIME_TYPES } from "@/lib/files/file-validation";
import { auth } from "@/lib/auth";
import { isServingAdmin } from "@/lib/admin/require-admin";

const DRIVE_FILE_ID_PATTERN = /^[A-Za-z0-9_-]{10,100}$/;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!isServingAdmin(session)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { fileId } = await params;
  if (!DRIVE_FILE_ID_PATTERN.test(fileId)) {
    return new Response("Not found", { status: 404 });
  }

  let meta;
  let buffer;
  try {
    meta = await drive.files.get({ fileId, fields: "mimeType" });
    buffer = await fetchFileBytes(fileId);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const driveMimeType = meta.data.mimeType ?? "";
  const contentType = (ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(
    driveMimeType,
  )
    ? driveMimeType
    : "application/octet-stream";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${fileId}"`,
    },
  });
}
