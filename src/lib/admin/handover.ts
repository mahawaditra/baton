import type { AdminRole, Prisma } from "@/generated/prisma/client";
import { deleteAdminsKeepingHistory } from "@/lib/admin/admin-deletion";
import { toJakartaCalendarDate } from "@/lib/format";
import { getRoleLabel } from "@/lib/labels";

export function handoverTitle(staffCount: number): string {
  return staffCount === 0
    ? "DELETE your position as Ketua Logistik?"
    : `DELETE all ${staffCount} staff including you?`;
}

export function handoverDescription(staffCount: number): string {
  const who = staffCount === 0 ? "You" : "You and your comrades";
  return `You're about to end your position as Ketua Logistik. ${who} will lose all access to BATON, and the position will be handed over to the new Ketua Logistik. Enter the new sacrifice's email and name:`;
}

export function buildTombstoneData(params: {
  ketuaAdminId: string;
  ketuaName: string;
  ketuaCreatedAt: Date;
  signatorySection: string;
  signatoryYear: string;
  staffNames: string[];
}) {
  return {
    termYear: toJakartaCalendarDate(params.ketuaCreatedAt).getUTCFullYear(),
    ketuaName: params.ketuaName,
    ketuaSection: params.signatorySection,
    ketuaAngkatan: params.signatoryYear,
    staffNames: params.staffNames,
    ketuaAdminId: params.ketuaAdminId,
  };
}

export async function runHandover(
  tx: Prisma.TransactionClient,
  params: { adminId: string; email: string; name: string },
): Promise<{ error: string | null }> {
  const { adminId, email, name } = params;

  const me = await tx.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      handoverAt: true,
    },
  });
  if (!me || me.role !== "ketua") {
    return { error: "Only the Ketua can hand over the position." };
  }
  if (me.handoverAt) {
    return { error: "You have already started the handover." };
  }

  const existing = await tx.admin.findUnique({
    where: { email },
    select: { role: true },
  });
  if (existing && existing.role !== "staff") {
    return {
      error: `${email} is already registered as ${getRoleLabel(existing.role)}.`,
    };
  }

  const loanSettings = await tx.loanSetting.findFirst({
    select: { signatorySection: true, signatoryYear: true },
  });
  if (!loanSettings) {
    return {
      error:
        "Fill in Loan Settings first. Your section and year appear on the Legacy wall.",
    };
  }

  const staff = await tx.admin.findMany({
    where: { role: "staff" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  await tx.tombstone.create({
    data: buildTombstoneData({
      ketuaAdminId: me.id,
      ketuaName: me.name,
      ketuaCreatedAt: me.createdAt,
      signatorySection: loanSettings.signatorySection,
      signatoryYear: loanSettings.signatoryYear,
      staffNames: staff.map((s) => s.name),
    }),
  });

  await tx.activityLog.create({
    data: {
      adminId: me.id,
      action: "handover_ketua",
      entityType: "admin",
      entityId: me.id,
      metadata: {
        newKetua: { name, email },
        deletedStaff: staff.map((s) => s.name),
      },
    },
  });

  await deleteAdminsKeepingHistory(
    tx,
    staff.map((s) => s.id),
  );

  await tx.admin.create({
    data: { email, name, role: "ketua", emailVerified: true },
  });

  await tx.admin.update({
    where: { id: me.id },
    data: { handoverAt: new Date() },
  });

  return { error: null };
}

export async function runCompleteHandover(
  tx: Prisma.TransactionClient,
  params: { adminId: string; tombstoneId: string; driveFileId: string },
): Promise<{ error: string | null }> {
  const { adminId, tombstoneId, driveFileId } = params;

  const me = await tx.admin.findUnique({
    where: { id: adminId },
    select: { role: true, handoverAt: true },
  });
  if (!me || me.role !== "ketua" || !me.handoverAt) {
    return { error: "There is no handover in progress for this account." };
  }

  const claimed = await tx.tombstone.updateMany({
    where: { id: tombstoneId, ketuaAdminId: adminId, photoDriveFileId: null },
    data: { photoDriveFileId: driveFileId },
  });
  if (claimed.count === 0) {
    return { error: "This handover has already been completed." };
  }

  await tx.activityLog.create({
    data: {
      adminId,
      action: "complete_handover",
      entityType: "admin",
      entityId: adminId,
    },
  });

  await deleteAdminsKeepingHistory(tx, [adminId]);

  return { error: null };
}

export function needsSignatoryUpdate(
  role: AdminRole,
  adminId: string,
  loanSettings: { updatedBy: string | null } | null,
): boolean {
  return role === "ketua" && loanSettings?.updatedBy !== adminId;
}
