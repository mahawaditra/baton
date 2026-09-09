"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { replaceItemPhoto } from "@/lib/drive";
import { driveTimestamp } from "@/lib/format";
import { validateImageUpload } from "@/lib/file-validation";

const updateGoodSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  brand: z.string().trim().max(100).nullable(),
  quantity: z.coerce
    .number("Quantity must be a number")
    .int()
    .nonnegative("Quantity cannot be negative"),
  condition: z.enum(
    ["ok", "need_repair", "retired", "lost"],
    "Invalid condition value",
  ),
  location: z.string().trim().min(1, "Location is required").max(100),
  registrationNo: z.string().trim().max(100).nullable(),
  notes: z.string().trim().max(1000).nullable(),
});

export type UpdateGoodState = {
  error: string | null;
};

export async function updateGood(
  id: string,
  prevState: UpdateGoodState,
  formData: FormData,
): Promise<UpdateGoodState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Not logged in");

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
    return { error: parsed.error.issues[0].message };
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

  revalidatePath(`/admin/goods/${id}`);
  revalidatePath(`/admin/goods`);
  revalidatePath(`/admin/dashboard`);
  revalidatePath(`/admin/activity`);
  redirect(`/admin/goods/${id}`);
}

export async function uploadGoodPhoto(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in");

  const file = formData.get("photo") as File;
  const validation = await validateImageUpload(file);
  if (!validation.valid) throw new Error(validation.error);

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

  revalidatePath(`/admin/goods/${id}`);
  revalidatePath(`/admin/goods`);
}
