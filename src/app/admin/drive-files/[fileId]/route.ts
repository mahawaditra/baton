import { drive, fetchFileBytes } from "@/lib/drive";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;

  const meta = await drive.files.get({ fileId, fields: "mimeType" });
  const buffer = await fetchFileBytes(fileId);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": meta.data.mimeType ?? "application/octet-stream",
    },
  });
}
