"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { revalidatePath } from "next/cache";

export async function transferToOngoing() {
  const session = await requireAdmin();

  const result = await prisma.borrowingRequest.updateMany({
    where: {
      status: { in: ["active", "overdue"] },
      carriedOverAt: null,
    },
    data: { carriedOverAt: new Date() },
  });

  if (result.count > 0) {
    await prisma.activityLog.create({
      data: {
        action: "transfer_to_ongoing",
        adminId: session.user.id,
        entityType: "admin",
        entityId: session.user.id,
        metadata: { count: result.count },
      },
    });
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/requests");
  revalidatePath("/admin/activity");

  return { count: result.count };
}
