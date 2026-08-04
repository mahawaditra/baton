"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateInstrument(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not logged in");
  }

  const before = await prisma.instrument.findUniqueOrThrow({
    where: { id },
  });

  const statusLocked =
    before.status === "reserved" || before.status === "borrowed";

  const condition = formData.get("condition") as string;
  let status = formData.get("status") as string;
  let isLoanable = formData.get("isLoanable") === "true";

  if (condition === "retired" || condition === "lost") {
    isLoanable = false;
  }

  if (statusLocked) {
    status = before.status;
  } else if (condition === "retired" || condition === "lost") {
    status = "unavailable";
  }

  const updated = await prisma.instrument.update({
    where: { id },
    data: {
      brand: formData.get("brand") as string,
      serialNumber: formData.get("serialNumber") as string,
      condition: condition as any,
      status: status as any,
      isLoanable,
      location: formData.get("location") as string,
      notes: formData.get("notes") as string,
    },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_instrument",
      entityType: "instrument",
      entityId: id,
      metadata: {
        before,
        after: updated,
      },
    },
  });

  revalidatePath(`/admin/instruments/${id}`);
  redirect(`/admin/instruments/${id}`);
}
