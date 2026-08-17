"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createInstrumentSchema = z.object({
  section: z.string().trim().min(1, "Section is required").max(100),
  type: z.string().trim().min(1, "Type is required").max(100),
  brand: z.string().trim().max(100).nullable(),
  serialNumber: z.string().trim().max(100).nullable(),
  condition: z.enum(
    ["ok", "need_repair", "retired", "lost"],
    "Invalid condition value",
  ),
  location: z.string().trim().min(1, "Location is required").max(100),
  notes: z.string().trim().max(1000).nullable(),
});

export type CreateInstrumentState = {
  error: string | null;
};

export async function createInstrument(
  prevState: CreateInstrumentState,
  formData: FormData,
): Promise<CreateInstrumentState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new Error("Not logged in");
  }

  const parsed = createInstrumentSchema.safeParse({
    section: formData.get("section"),
    type: formData.get("type"),
    brand: formData.get("brand") || null,
    serialNumber: formData.get("serialNumber") || null,
    condition: formData.get("condition"),
    location: formData.get("location"),
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { section, type, brand, serialNumber, condition, location, notes } =
    parsed.data;

  let isLoanable = formData.get("isLoanable") === "true";
  if (condition === "retired" || condition === "lost") {
    isLoanable = false;
  }

  const status =
    condition === "retired" || condition === "lost"
      ? "unavailable"
      : "available";

  const instrument = await prisma.instrument.create({
    data: {
      section,
      type,
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
      action: "create_instrument",
      entityType: "instrument",
      entityId: instrument.id,
      metadata: { after: instrument },
    },
  });

  revalidatePath("/admin/instruments");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/activity");
  redirect(`/admin/instruments/${instrument.id}`);
}
