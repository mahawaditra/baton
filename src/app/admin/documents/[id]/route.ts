import { prisma } from "@/lib/prisma";
import { drive } from "@/lib/drive";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const doc = await prisma.document.findUniqueOrThrow({
    where: { id },
  });

  const res = await drive.files.get(
    {
      fileId: doc.driveFileId,
      alt: "media",
    },
    { responseType: "arraybuffer" },
  );

  const buffer = Buffer.from(res.data as ArrayBuffer);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": doc.mimeType,
    },
  });
}
