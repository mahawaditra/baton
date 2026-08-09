import { prisma } from "@/lib/prisma";
import { fetchFileBytes } from "@/lib/drive";
import { ALLOWED_UPLOAD_MIME_TYPES } from "@/lib/file-validation";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  const doc = await prisma.document.findUniqueOrThrow({
    where: { id },
  });

  const buffer = await fetchFileBytes(doc.driveFileId);

  const contentType = (ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(
    doc.mimeType,
  )
    ? doc.mimeType
    : "application/octet-stream";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `inline; filename="${doc.type}-${doc.id}"`,
    },
  });
}
