"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  getOrCreateYearFolder,
  getOrCreateFolder,
  uploadFile,
} from "@/lib/drive";
import { buildXlsxBuffer } from "@/lib/xlsx";

export async function generateAnnualReport() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in");

  const year = new Date().getFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const now = new Date();

  const activeLoans = await prisma.borrowingRequest.count({
    where: { status: { in: ["active", "overdue"] } },
  });

  const requestsThisYear = await prisma.borrowingRequest.count({
    where: { createdAt: { gte: yearStart, lte: now } },
  });

  const statusBreakdown = await prisma.borrowingRequest.groupBy({
    by: ["status"],
    where: { createdAt: { gte: yearStart, lte: now } },
    _count: true,
  });

  const updateLogs = await prisma.activityLog.findMany({
    where: {
      action: "update_instrument",
      createdAt: { gte: yearStart, lte: now },
    },
    select: { metadata: true },
  });
  const revitalizedCount = updateLogs.filter((log) => {
    const meta = log.metadata as {
      before?: { condition?: string };
      after?: { condition?: string };
    } | null;
    return (
      meta?.before?.condition === "need_repair" &&
      meta?.after?.condition === "ok"
    );
  }).length;

  const summaryRows = [
    { Metric: "Peminjaman Sedang Berjalan", Value: activeLoans },
    {
      Metric: `Request Dibuat (1 Jan ${year} - ${now.toLocaleDateString("id-ID")})`,
      Value: requestsThisYear,
    },
    ...statusBreakdown.map((s) => ({
      Metric: `  Status: ${s.status}`,
      Value: s._count,
    })),
    {
      Metric: "Instrumen Direvitalisasi (need_repair → ok)",
      Value: revitalizedCount,
    },
  ];

  const buffer = buildXlsxBuffer(summaryRows, "Summary");

  const yearFolder = await getOrCreateYearFolder(year);
  const reportsFolder = await getOrCreateFolder("Annual Reports", yearFolder);

  const fileName = `Annual_Report_${year}_${now.toISOString().slice(0, 10)}.xlsx`;
  const driveFileId = await uploadFile(
    fileName,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer,
    reportsFolder,
  );

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "generate_annual_report",
      entityType: "admin",
      entityId: session.user.id,
      metadata: { year, driveFileId },
    },
  });

  revalidatePath("/admin/activity");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    driveUrl: `https://drive.google.com/file/d/${driveFileId}/view`,
    summary: summaryRows,
  };
}
