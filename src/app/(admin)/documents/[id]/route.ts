import { prisma } from "@/lib/prisma";
import { fetchFileBytes } from "@/lib/files/drive";
import { ALLOWED_UPLOAD_MIME_TYPES } from "@/lib/files/file-validation";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { isServingAdmin } from "@/lib/admin/require-admin";

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!isServingAdmin(session)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return new Response("Not found", { status: 404 });
  }
  const doc = await prisma.document.findUnique({
    where: { id },
  });
  if (!doc) return new Response("Not found", { status: 404 });

  const buffer = await fetchFileBytes(doc.driveFileId);

  const contentType = (ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(
    doc.mimeType,
  )
    ? doc.mimeType
    : "application/octet-stream";

  const extension = EXTENSION_BY_MIME_TYPE[contentType];
  const filename = `${doc.type}-${doc.id}${extension ? `.${extension}` : ""}`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
