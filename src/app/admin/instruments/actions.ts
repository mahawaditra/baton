"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx/xlsx.mjs";
import {
  getOrCreateYearFolder,
  getOrCreateFolder,
  uploadFile,
} from "@/lib/drive";

export async function exportInventorySnapshot(label: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not logged in");
  }

  const instruments = await prisma.instrument.findMany({
    orderBy: {
      section: "asc",
    },
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

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

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

  revalidatePath("/admin/instruments");
  revalidatePath("/admin/activity");
  return { success: true, driveFileId };
}
