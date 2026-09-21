"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { replaceSignatureImage } from "@/lib/drive";
import { runHandover } from "@/lib/handover";
import { invalidateFooterCache } from "@/lib/mail";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { ACTIVE_INSTRUMENT_HOLD_STATUSES } from "@/lib/loan-rules";
import {
  assignableRoles,
  canEditSettings,
  canSetActive,
  canViewAdminManagement,
} from "@/lib/roles";

const addAdminSchema = z.object({
  email: z.email("Invalid email address"),
  name: z.string().trim().min(1, "Name is required").max(100),
  role: z.enum(["staff", "ketua"], "Invalid role"),
});

const handoverSchema = addAdminSchema.pick({ email: true, name: true });

const updateLoanSettingsSchema = z
  .object({
    dueDate: z.iso.date("Invalid due date"),
    depositAmount: z.coerce
      .number("Deposit amount must be a number")
      .int()
      .positive("Deposit amount must be a positive number"),
    depositPartialAmount: z.coerce
      .number("Partial deposit amount must be a number")
      .int()
      .positive("Partial deposit amount must be a positive number"),
    depositGraceDays: z.coerce
      .number("Grace days must be a number")
      .int()
      .nonnegative("Grace days cannot be negative"),
    bankName: z.string().trim().min(1, "Bank name is required").max(100),
    bankAccount: z.string().trim().min(1, "Bank account is required").max(50),
    bankHolder: z
      .string()
      .trim()
      .min(1, "Bank account holder is required")
      .max(100),
    signatoryName: z
      .string()
      .trim()
      .min(1, "Signatory name is required")
      .max(100),
    signatoryPhone: z
      .string()
      .trim()
      .min(1, "Signatory phone is required")
      .max(20),
    signatoryLineId: z
      .string()
      .trim()
      .min(1, "Signatory LINE ID is required")
      .max(50),
    signatoryAddressKtp: z
      .string()
      .trim()
      .min(1, "Signatory KTP address is required")
      .max(300),
    signatoryAddressDomicile: z
      .string()
      .trim()
      .min(1, "Signatory domicile address is required")
      .max(300),
    signatoryFaculty: z
      .string()
      .trim()
      .min(1, "Signatory faculty is required")
      .max(60, "Signatory faculty must be 60 characters or fewer")
      .regex(/^[^/]+$/, "Signatory faculty cannot contain a / character"),
    signatoryMajor: z
      .string()
      .trim()
      .min(1, "Signatory major is required")
      .max(60, "Signatory major must be 60 characters or fewer")
      .regex(/^[^/]+$/, "Signatory major cannot contain a / character"),
    signatoryYear: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Signatory year must be a 4-digit year"),
    signatorySection: z
      .string()
      .trim()
      .min(1, "Signatory section is required")
      .max(100),
    signatoryKtpNumber: z
      .string()
      .trim()
      .regex(/^\d{16}$/, "Signatory KTP number must be 16 digits"),
  })
  .refine((data) => data.depositPartialAmount < data.depositAmount, {
    message: "Partial deposit amount must be less than the full deposit amount",
    path: ["depositPartialAmount"],
  });

export type AddAdminState = {
  success: boolean;
  error: string | null;
  generalError: string | null;
};

export async function addAdmin(
  prevState: AddAdminState,
  formData: FormData,
): Promise<AddAdminState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || assignableRoles(session.user.role).length === 0) {
    return {
      success: false,
      error: null,
      generalError: "You don't have permission to add admins.",
    };
  }

  const parsed = addAdminSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role") ?? "staff",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      generalError: null,
    };
  }

  const { email, name, role } = parsed.data;

  if (!assignableRoles(session.user.role).includes(role)) {
    return {
      success: false,
      error: null,
      generalError: "You can't add an admin with this role.",
    };
  }

  let newAdmin;
  try {
    newAdmin = await prisma.admin.create({
      data: { email, name, role, emailVerified: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        success: false,
        error: "An admin with this email already exists.",
        generalError: null,
      };
    }
    throw err;
  }

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "add_admin",
      entityType: "admin",
      entityId: newAdmin.id,
      metadata: {
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
  return { success: true, error: null, generalError: null };
}

export type HandoverState = { error: string | null };

export async function handoverKetua(
  formData: FormData,
): Promise<HandoverState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "ketua") {
    return { error: "Only the Ketua can hand over the position." };
  }

  const parsed = handoverSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    name: String(formData.get("name") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, name } = parsed.data;

  let outcome: { error: string | null };
  try {
    outcome = await prisma.$transaction(
      (tx) => runHandover(tx, { adminId: session.user.id, email, name }),
      { timeout: 30_000, maxWait: 10_000 },
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: "That email is already registered." };
    }
    throw err;
  }

  if (outcome.error) return { error: outcome.error };

  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
  redirect("/limbo");
}

export type UpdateLoanSettingsState = {
  success: boolean;
  error: string | null;
};

export async function updateLoanSettings(
  prevState: UpdateLoanSettingsState,
  formData: FormData,
): Promise<UpdateLoanSettingsState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Not logged in");
  if (!canEditSettings(session.user.role)) {
    throw new Error("Only Ketua or Overlord can update loan settings.");
  }

  const parsed = updateLoanSettingsSchema.safeParse({
    dueDate: formData.get("dueDate"),
    depositAmount: formData.get("depositAmount"),
    depositPartialAmount: formData.get("depositPartialAmount"),
    depositGraceDays: formData.get("depositGraceDays"),
    bankName: formData.get("bankName"),
    bankAccount: formData.get("bankAccount"),
    bankHolder: formData.get("bankHolder"),
    signatoryName: formData.get("signatoryName"),
    signatoryPhone: formData.get("signatoryPhone"),
    signatoryLineId: formData.get("signatoryLineId"),
    signatoryAddressKtp: formData.get("signatoryAddressKtp"),
    signatoryAddressDomicile: formData.get("signatoryAddressDomicile"),
    signatoryFaculty: formData.get("signatoryFaculty"),
    signatoryMajor: formData.get("signatoryMajor"),
    signatoryYear: formData.get("signatoryYear"),
    signatorySection: formData.get("signatorySection"),
    signatoryKtpNumber: formData.get("signatoryKtpNumber"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const {
    dueDate,
    depositAmount,
    depositPartialAmount,
    depositGraceDays,
    bankName,
    bankAccount,
    bankHolder,
    signatoryName,
    signatoryPhone,
    signatoryLineId,
    signatoryAddressKtp,
    signatoryAddressDomicile,
    signatoryFaculty,
    signatoryMajor,
    signatoryYear,
    signatorySection,
    signatoryKtpNumber,
  } = parsed.data;
  const signatoryFacultyMajor = `${signatoryFaculty}/${signatoryMajor}`;

  const existing = await prisma.loanSetting.findFirst();

  let signatoryImageDriveId = existing?.signatoryImageDriveId ?? null;

  const imageFile = formData.get("signatoryImage") as File;
  if (imageFile?.size) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    signatoryImageDriveId = await replaceSignatureImage({
      buffer,
      mimeType: imageFile.type,
      oldFileId: existing?.signatoryImageDriveId ?? null,
    });
  }

  const data = {
    dueDate: new Date(dueDate),
    depositAmount,
    depositPartialAmount,
    depositGraceDays,
    bankName,
    bankAccount,
    bankHolder,
    updatedBy: session.user.id,

    signatoryName,
    signatoryPhone,
    signatoryLineId,
    signatoryAddressKtp,
    signatoryAddressDomicile,
    signatoryFaculty: signatoryFacultyMajor,
    signatoryYear,
    signatorySection,
    signatoryKtpNumber,
    signatoryImageDriveId,
  };

  const updated = existing
    ? await prisma.loanSetting.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.loanSetting.create({ data });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_loan_settings",
      entityType: "loan_settings",
      entityId: updated.id,
      metadata: existing
        ? { before: existing, after: updated }
        : { after: updated },
    },
  });

  invalidateFooterCache();

  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");

  return { success: true, error: null };
}

export async function setSignatoryPhonePublic(value: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in");
  if (!canEditSettings(session.user.role)) {
    throw new Error("Only Ketua or Overlord can update loan settings.");
  }

  const existing = await prisma.loanSetting.findFirst();
  if (!existing) throw new Error("Loan settings have not been set up yet.");

  const updated = await prisma.loanSetting.update({
    where: { id: existing.id },
    data: { signatoryPhonePublic: value },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_loan_settings",
      entityType: "loan_settings",
      entityId: updated.id,
      metadata: { before: existing, after: updated },
    },
  });

  invalidateFooterCache();
  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
}

export async function setSignatoryLineAddFriendPublic(value: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in");
  if (!canEditSettings(session.user.role)) {
    throw new Error("Only Ketua or Overlord can update loan settings.");
  }

  const existing = await prisma.loanSetting.findFirst();
  if (!existing) throw new Error("Loan settings have not been set up yet.");

  const updated = await prisma.loanSetting.update({
    where: { id: existing.id },
    data: { signatoryLineAddFriendPublic: value },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_loan_settings",
      entityType: "loan_settings",
      entityId: updated.id,
      metadata: { before: existing, after: updated },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
}

export type SetSignatoryLineAddFriendUrlResult =
  | { success: true }
  | { success: false; error: string };

export async function setSignatoryLineAddFriendUrl(
  value: string,
): Promise<SetSignatoryLineAddFriendUrlResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in");
  if (!canEditSettings(session.user.role)) {
    throw new Error("Only Ketua or Overlord can update loan settings.");
  }

  const trimmed = value.trim();
  const parsed = z
    .url("Must be a valid URL (e.g. https://line.me/ti/p/...).")
    .nullable()
    .safeParse(trimmed === "" ? null : trimmed);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.loanSetting.findFirst();
  if (!existing) throw new Error("Loan settings have not been set up yet.");

  const updated = await prisma.loanSetting.update({
    where: { id: existing.id },
    data: { signatoryLineAddFriendUrl: parsed.data },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_loan_settings",
      entityType: "loan_settings",
      entityId: updated.id,
      metadata: { before: existing, after: updated },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");

  return { success: true };
}

export async function setAdminActive(adminId: string, isActive: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Not logged in");
  if (!canViewAdminManagement(session.user.role)) {
    throw new Error("You don't have permission to manage admins.");
  }

  if (session.user.id === adminId) {
    throw new Error("You can't deactivate your own account.");
  }

  const target = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, role: true },
  });
  if (!target) throw new Error("Admin not found.");

  if (!canSetActive(session.user, target)) {
    throw new Error("You can't change the status of this admin.");
  }

  const targetAdmin = await prisma.admin.update({
    where: { id: adminId },
    data: { isActive },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: isActive ? "reactivate_admin" : "deactivate_admin",
      entityType: "admin",
      entityId: adminId,
      metadata: { name: targetAdmin.name, email: targetAdmin.email },
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
}

export type AdjustInstrumentTypeSlotResult =
  | { success: true; value: number }
  | { success: false; error: string };

export async function adjustInstrumentTypeSlot(
  instrumentType: string,
  direction: "increase" | "decrease",
): Promise<AdjustInstrumentTypeSlotResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not logged in");
  if (!canEditSettings(session.user.role)) {
    throw new Error(
      "Only Ketua or Overlord can update instrument slot settings.",
    );
  }

  const existing = await prisma.instrumentTypeSlot.findUnique({
    where: { instrumentType },
  });
  const current = existing?.maxConcurrentLoans ?? 1;
  const next = direction === "increase" ? current + 1 : current - 1;

  if (next < 1) {
    return { success: false, error: "Slot can't go below 1." };
  }

  if (direction === "decrease") {
    const instruments = await prisma.instrument.findMany({
      where: { type: { contains: instrumentType, mode: "insensitive" } },
      include: {
        _count: {
          select: {
            borrowingRequests: {
              where: { status: { in: [...ACTIVE_INSTRUMENT_HOLD_STATUSES] } },
            },
          },
        },
      },
    });
    const floor = instruments.reduce(
      (max, inst) => Math.max(max, inst._count.borrowingRequests),
      1,
    );
    if (next < floor) {
      return {
        success: false,
        error: `Can't go below ${floor} — at least one ${instrumentType} unit currently has ${floor} active borrower(s).`,
      };
    }
  }

  const updated = await prisma.instrumentTypeSlot.upsert({
    where: { instrumentType },
    create: {
      instrumentType,
      maxConcurrentLoans: next,
      updatedBy: session.user.id,
    },
    update: { maxConcurrentLoans: next, updatedBy: session.user.id },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "update_instrument_type_slot",
      entityType: "instrument_type_slot",
      entityId: updated.id,
      metadata: { instrumentType, before: current, after: next },
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");

  return { success: true, value: updated.maxConcurrentLoans };
}
