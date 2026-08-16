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
import { toJakartaCalendarDate } from "@/lib/format";

async function computeAnnualReportSummary(year: number) {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const now = new Date();
  const periodEnd = toJakartaCalendarDate(now);

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
      Metric: `Request Dibuat (1 Jan ${year} - ${periodEnd.toLocaleDateString("id-ID")})`,
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

  return { year, periodEnd, summaryRows };
}

export async function previewAnnualReport() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in");

  const year = new Date().getFullYear();
  return computeAnnualReportSummary(year);
}

export async function saveAnnualReport() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in");

  const year = new Date().getFullYear();
  const { periodEnd, summaryRows } = await computeAnnualReportSummary(year);

  const report = await prisma.annualReport.create({
    data: {
      year,
      periodEnd,
      summary: summaryRows,
      createdBy: session.user.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "generate_annual_report",
      entityType: "admin",
      entityId: session.user.id,
      metadata: { year, reportId: report.id },
    },
  });

  revalidatePath("/admin/activity");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/reports");
}

export async function exportInventorySnapshot(label: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const instruments = await prisma.instrument.findMany({
    orderBy: { section: "asc" },
  });

  const rows = instruments.map((inst) => ({
    Section: inst.section,
    Type: inst.type,
    Brand: inst.brand ?? "",
    "Serial Number": inst.serialNumber ?? "",
    Condition: inst.condition,
    Status: inst.status,
    Location: inst.location,
    Notes: inst.notes ?? "",
  }));

  const buffer = buildXlsxBuffer(rows, "Inventory");

  const year = new Date().getFullYear();
  const yearFolder = await getOrCreateYearFolder(year);
  const snapshotFolder = await getOrCreateFolder(
    "Inventory Snapshots",
    yearFolder,
  );

  const safeLabel = label.replace(/[^a-zA-Z0-9-_ ]/g, "_");
  const fileName = `Inventarisasi_${safeLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const driveFileId = await uploadFile(
    fileName,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer,
    snapshotFolder,
  );

  const snapshot = await prisma.inventorySnapshot.create({
    data: {
      label,
      driveFileId,
      createdBy: session.user.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "export_snapshot",
      entityType: "inventory_snapshot",
      entityId: snapshot.id,
      metadata: {
        label,
        instrumentCount: instruments.length,
      },
    },
  });

  revalidatePath("/admin/reports");
  revalidatePath("/admin/activity");
  return { success: true, driveFileId };
}
