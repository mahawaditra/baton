"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const updateInstrumentSchema = z.object({
  brand: z.string().trim().max(100).nullable(),
  serialNumber: z.string().trim().max(100).nullable(),
  condition: z.enum(
    ["ok", "need_repair", "retired", "lost"],
    "Invalid condition value",
  ),
  status: z.enum(
    ["available", "reserved", "borrowed", "placed", "unavailable"],
    "Invalid status value",
  ),
  location: z.string().trim().min(1, "Location is required").max(100),
  notes: z.string().trim().max(1000).nullable(),
});

export type UpdateInstrumentState = {
  error: string | null;
};

export async function updateInstrument(
  id: string,
  prevState: UpdateInstrumentState,
  formData: FormData,
): Promise<UpdateInstrumentState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not logged in");
  }

  const before = await prisma.instrument.findUniqueOrThrow({
    where: { id },
  });

  const parsed = updateInstrumentSchema.safeParse({
    brand: formData.get("brand") || null,
    serialNumber: formData.get("serialNumber") || null,
    condition: formData.get("condition"),
    status: formData.get("status"),
    location: formData.get("location"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { brand, serialNumber, condition, location, notes } = parsed.data;
  let { status } = parsed.data;

  const statusLocked =
    before.status === "reserved" || before.status === "borrowed";

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
      brand,
      serialNumber,
      condition,
      status,
      isLoanable,
      location,
      notes,
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
  revalidatePath(`/admin/instruments`);
  revalidatePath(`/admin/dashboard`);
  revalidatePath(`/admin/activity`);
  redirect(`/admin/instruments/${id}`);
}
