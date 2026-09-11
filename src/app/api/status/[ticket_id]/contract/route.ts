import { prisma } from "@/lib/prisma";
import { fetchFileBytes } from "@/lib/drive";
import { verifyDownloadToken } from "@/lib/download-token";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticket_id: string }> },
) {
  const { ticket_id: ticketId } = await params;
  const token = new URL(req.url).searchParams.get("token");

  if (!token || !verifyDownloadToken(token, ticketId)) {
    return new Response("Link kedaluwarsa atau tidak valid.", {
      status: 403,
    });
  }

  const request = await prisma.borrowingRequest.findUnique({
    where: { ticketId },
    select: { id: true, borrowerName: true },
  });
  if (!request) {
    return new Response("Pengajuan tidak ditemukan.", { status: 404 });
  }

  const period = await prisma.loanPeriod.findFirst({
    where: { requestId: request.id },
    orderBy: { sequence: "desc" },
  });
  if (!period?.contractDriveFileId) {
    return new Response("PDF kontrak tidak ditemukan.", { status: 404 });
  }

  const buffer = await fetchFileBytes(period.contractDriveFileId);
  const fileName =
    period.periodType === "extension"
      ? `Kontrak ${request.borrowerName}_${ticketId}_Ext${period.sequence}.pdf`
      : `Kontrak ${request.borrowerName}_${ticketId}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
