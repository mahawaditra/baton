"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validationErrors, type FieldErrors } from "@/lib/form-errors";

const createGoodSchema = z.object({
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

export type CreateGoodState = {
  error: string | null;
  fieldErrors?: FieldErrors;
};

export async function createGood(
  prevState: CreateGoodState,
  formData: FormData,
): Promise<CreateGoodState> {
  const session = await requireAdmin();

  const parsed = createGoodSchema.safeParse({
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

  const good = await prisma.good.create({
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
      action: "create_goods",
      entityType: "goods",
      entityId: good.id,
      metadata: { after: good },
    },
  });

  revalidatePath("/goods");
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  redirect(`/goods/${good.id}`);
}
