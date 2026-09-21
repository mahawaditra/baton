"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { revalidatePath } from "next/cache";
import {
  getOrCreateYearFolder,
  getOrCreateFolder,
  uploadFile,
} from "@/lib/files/drive";
import { buildXlsxBuffer } from "@/lib/files/xlsx";
import {
  buildAnnualSummaryRows,
  currentYearInJakarta,
  formatJakartaDate,
  toJakartaCalendarDate,
  todayInJakarta,
} from "@/lib/format";
import { getConditionLabel, getStatusLabel } from "@/lib/labels";
import {
  ACTIVE_INSTRUMENT_HOLD_STATUSES,
  formatSharedLocation,
} from "@/lib/loan/loan-rules";

async function computeAnnualReportSummary(year: number) {
  const yearStart = new Date(Date.UTC(year, 0, 1, -7));
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

  const summaryRows = buildAnnualSummaryRows({
    year,
    periodEnd,
    activeLoans,
    requestsThisYear,
    statusBreakdown,
    revitalizedCount,
  });

  return { year, periodEnd, summaryRows };
}

export async function previewAnnualReport() {
  await requireAdmin();

  const year = currentYearInJakarta();
  return computeAnnualReportSummary(year);
}

export async function saveAnnualReport() {
  const session = await requireAdmin();

  const year = currentYearInJakarta();
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

export async function exportInventorySnapshot(formData: FormData) {
  const session = await requireAdmin();

  const rawLabel = String(formData.get("label") ?? "").trim().slice(0, 100);
  const label = rawLabel || `Snapshot ${formatJakartaDate(new Date())}`;

  const instruments = await prisma.instrument.findMany({
    orderBy: { section: "asc" },
    include: {
      borrowingRequests: {
        where: { status: { in: [...ACTIVE_INSTRUMENT_HOLD_STATUSES] } },
        select: { borrowerName: true, borrowerNickname: true, borrowerYear: true },
      },
    },
  });

  const rows = instruments.map((inst) => ({
    Section: inst.section,
    Type: inst.type,
    Brand: inst.brand ?? "",
    "Serial Number": inst.serialNumber ?? "",
    Condition: getConditionLabel(inst.condition),
    Status: getStatusLabel(inst.status),
    Location: formatSharedLocation(inst.borrowingRequests, inst.location),
    Notes: inst.notes ?? "",
  }));

  const buffer = buildXlsxBuffer(rows, "Inventory");

  const year = currentYearInJakarta();
  const yearFolder = await getOrCreateYearFolder(year);
  const snapshotFolder = await getOrCreateFolder(
    "Inventory Snapshots",
    yearFolder,
  );

  const safeLabel = label.replace(/[^a-zA-Z0-9-_ ]/g, "_");
  const fileName = `Inventarisasi_${safeLabel}_${todayInJakarta().toISOString().slice(0, 10)}.xlsx`;

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
}
