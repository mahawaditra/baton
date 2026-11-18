"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validationErrors, type FieldErrors } from "@/lib/form-errors";
import { isOutOfServiceCondition } from "@/lib/loan/loan-rules";

const createInstrumentSchema = z.object({
  section: z.string().trim().min(1, "Section is required").max(100, "100 characters max."),
  type: z.string().trim().min(1, "Type is required").max(100, "100 characters max."),
  brand: z.string().trim().max(100, "100 characters max.").nullable(),
  serialNumber: z.string().trim().max(100, "100 characters max.").nullable(),
  condition: z.enum(
    ["ok", "need_repair", "retired", "lost"],
    "Invalid condition value",
  ),
  location: z.string().trim().min(1, "Location is required").max(100, "100 characters max."),
  notes: z.string().trim().max(1000, "1000 characters max.").nullable(),
});

export type CreateInstrumentState = {
  error: string | null;
  fieldErrors?: FieldErrors;
};

export async function createInstrument(
  prevState: CreateInstrumentState,
  formData: FormData,
): Promise<CreateInstrumentState> {
  const session = await requireAdmin();

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
    return validationErrors(parsed.error);
  }

  const { section, type, brand, serialNumber, condition, location, notes } =
    parsed.data;

  let isLoanable = formData.get("isLoanable") === "true";
  if (isOutOfServiceCondition(condition)) {
    isLoanable = false;
  }

  const status = isOutOfServiceCondition(condition)
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

  revalidatePath("/instruments");
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  redirect(`/instruments/${instrument.id}`);
}
