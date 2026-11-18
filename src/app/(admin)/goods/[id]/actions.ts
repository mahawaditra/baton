"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validationErrors, type FieldErrors } from "@/lib/form-errors";
import { replaceItemPhoto } from "@/lib/files/drive";
import { driveTimestamp } from "@/lib/format";
import { validateImageUpload } from "@/lib/files/file-validation";

const updateGoodSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "100 characters max."),
  brand: z.string().trim().max(100, "100 characters max.").nullable(),
  quantity: z.coerce
    .number("Quantity must be a number")
    .int()
    .nonnegative("Quantity cannot be negative"),
  condition: z.enum(
    ["ok", "need_repair", "retired", "lost"],
    "Invalid condition value",
  ),
  location: z.string().trim().min(1, "Location is required").max(100, "100 characters max."),
  registrationNo: z.string().trim().max(100, "100 characters max.").nullable(),
  notes: z.string().trim().max(1000, "1000 characters max.").nullable(),
});

export type UpdateGoodState = {
  error: string | null;
  fieldErrors?: FieldErrors;
};

export async function updateGood(
  id: string,
  prevState: UpdateGoodState,
  formData: FormData,
): Promise<UpdateGoodState> {
  const session = await requireAdmin();

  const parsed = updateGoodSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand") || null,
    quantity: formData.get("quantity"),
    condition: formData.get("condition"),
    location: formData.get("location"),
    registrationNo: formData.get("registrationNo") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return validationErrors(parsed.error);
  }

  const { name, brand, quantity, condition, location, registrationNo, notes } =
    parsed.data;

  const before = await prisma.good.findUniqueOrThrow({ where: { id } });

  const updated = await prisma.good.update({
    where: { id },
    data: {
      name,
      brand,
      quantity,
      condition,
      location,
      registrationNo,
      notes,
    },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_goods",
      entityType: "goods",
      entityId: id,
      metadata: {
        before,
        after: updated,
      },
    },
  });

  revalidatePath(`/goods/${id}`);
  revalidatePath(`/goods`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/activity`);
  redirect(`/goods/${id}`);
}

export async function uploadGoodPhoto(id: string, formData: FormData) {
  const session = await requireAdmin();

  const photo = formData.get("photo");
  const file = photo instanceof File ? photo : null;
  const validation = await validateImageUpload(file);
  if (!file || !validation.valid) {
    throw new Error(validation.valid ? "Pilih file dulu." : validation.error);
  }

  const before = await prisma.good.findUniqueOrThrow({ where: { id } });
  const buffer = Buffer.from(await file.arrayBuffer());

  const newFileId = await replaceItemPhoto({
    name: `${before.name}_${driveTimestamp()}.jpg`,
    buffer,
    oldFileId: before.photoDriveFileId,
  });

  const after = await prisma.good.update({
    where: { id },
    data: { photoDriveFileId: newFileId },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_goods",
      entityType: "goods",
      entityId: id,
      metadata: { before, after },
    },
  });

  revalidatePath(`/goods/${id}`);
  revalidatePath(`/goods`);
}
