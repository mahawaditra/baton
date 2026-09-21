import type { Prisma } from "@/generated/prisma/client";

export async function deleteAdminsKeepingHistory(
  tx: Prisma.TransactionClient,
  adminIds: string[],
): Promise<void> {
  if (adminIds.length === 0) return;

  const admins = await tx.admin.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true },
  });

  for (const admin of admins) {
    await tx.activityLog.updateMany({
      where: { adminId: admin.id },
      data: { adminName: admin.name },
    });
    await tx.inventorySnapshot.updateMany({
      where: { createdBy: admin.id },
      data: { creatorName: admin.name },
    });
    await tx.annualReport.updateMany({
      where: { createdBy: admin.id },
      data: { creatorName: admin.name },
    });
  }

  await tx.admin.deleteMany({ where: { id: { in: adminIds } } });
}
