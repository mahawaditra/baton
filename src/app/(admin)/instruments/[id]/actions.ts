"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { replaceItemPhoto } from "@/lib/files/drive";
import { driveTimestamp } from "@/lib/format";
import { validateImageUpload } from "@/lib/files/file-validation";
import {
  ACTIVE_INSTRUMENT_HOLD_STATUSES,
  isOutOfServiceCondition,
} from "@/lib/loan/loan-rules";

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
  const session = await requireAdmin();

  const before = await prisma.instrument.findUniqueOrThrow({
    where: { id },
  });

  const activeHolderCount = await prisma.borrowingRequest.count({
    where: {
      instrumentId: id,
      status: { in: [...ACTIVE_INSTRUMENT_HOLD_STATUSES] },
    },
  });
  const statusLocked = activeHolderCount > 0;

  const parsed = updateInstrumentSchema.safeParse({
    brand: formData.get("brand") || null,
    serialNumber: formData.get("serialNumber") || null,
    condition: formData.get("condition") ?? before.condition,
    status: formData.get("status") ?? before.status,
    location: formData.get("location") ?? before.location,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { brand, serialNumber, notes } = parsed.data;
  let { status, condition, location } = parsed.data;

  if (statusLocked) {
    condition = before.condition;
    status = before.status;
    location = before.location;
  }

  let isLoanable = formData.get("isLoanable") === "true";

  if (isOutOfServiceCondition(condition)) {
    isLoanable = false;
  }

  if (!statusLocked && isOutOfServiceCondition(condition)) {
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

  revalidatePath(`/instruments/${id}`);
  revalidatePath(`/instruments`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/activity`);
  redirect(`/instruments/${id}`);
}

export async function uploadInstrumentPhoto(id: string, formData: FormData) {
  const session = await requireAdmin();

  const photo = formData.get("photo");
  const file = photo instanceof File ? photo : null;
  const validation = await validateImageUpload(file);
  if (!file || !validation.valid) {
    throw new Error(validation.valid ? "File wajib dipilih." : validation.error);
  }

  const before = await prisma.instrument.findUniqueOrThrow({ where: { id } });
  const buffer = Buffer.from(await file.arrayBuffer());

  const newFileId = await replaceItemPhoto({
    name: `${before.type}_${before.serialNumber ?? "NoSN"}_${driveTimestamp()}.jpg`,
    buffer,
    oldFileId: before.photoDriveFileId,
  });

  const after = await prisma.instrument.update({
    where: { id },
    data: { photoDriveFileId: newFileId },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_instrument",
      entityType: "instrument",
      entityId: id,
      metadata: { before, after },
    },
  });

  revalidatePath(`/instruments/${id}`);
  revalidatePath(`/instruments`);
}
