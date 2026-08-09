import { drive, fetchFileBytes } from "@/lib/drive";
import { ALLOWED_UPLOAD_MIME_TYPES } from "@/lib/file-validation";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { fileId } = await params;

  const meta = await drive.files.get({ fileId, fields: "mimeType" });
  const buffer = await fetchFileBytes(fileId);

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
      "Content-Disposition": `inline; filename="${fileId}"`,
    },
  });
}
