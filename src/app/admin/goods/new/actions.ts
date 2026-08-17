"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createGoodSchema = z.object({
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

export type CreateGoodState = {
  error: string | null;
};

export async function createGood(
  prevState: CreateGoodState,
  formData: FormData,
): Promise<CreateGoodState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Not logged in");

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
    return { error: parsed.error.issues[0].message };
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

  revalidatePath("/admin/goods");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/activity");
  redirect(`/admin/goods/${good.id}`);
}
