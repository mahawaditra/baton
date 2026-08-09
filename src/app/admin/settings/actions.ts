"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getOrCreateFolder, uploadFile } from "@/lib/drive";
import { driveTimestamp } from "@/lib/format";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

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
      .max(100, "Signatory faculty/major must be 100 characters or fewer")
      .regex(
        /^[^/]+\/[^/]+$/,
        "Signatory faculty/major format must be Faculty/Major, e.g. FT/Teknik Elektro",
      ),
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
    message:
      "Partial deposit amount must be less than the full deposit amount",
    path: ["depositPartialAmount"],
  });

export type AddAdminState = {
  success: boolean;
  error: string | null;
};

export async function addAdmin(
  prevState: AddAdminState,
  formData: FormData,
): Promise<AddAdminState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user.role !== "super_admin") {
    return { success: false, error: "Only super admin can add new admin" };
  }

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email || !name) {
    return { success: false, error: "Email and name are required" };
  }

  let newAdmin;
  try {
    newAdmin = await prisma.admin.create({
      data: { email, name, emailVerified: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        success: false,
        error: "An admin with this email already exists.",
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
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
  return { success: true, error: null };
}

export async function updateLoanSettings(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Not logged in");

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
    signatoryYear: formData.get("signatoryYear"),
    signatorySection: formData.get("signatorySection"),
    signatoryKtpNumber: formData.get("signatoryKtpNumber"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
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
    signatoryYear,
    signatorySection,
    signatoryKtpNumber,
  } = parsed.data;

  const existing = await prisma.loanSetting.findFirst();

  let signatoryImageDriveId = existing?.signatoryImageDriveId ?? null;

  const imageFile = formData.get("signatoryImage") as File;
  if (imageFile?.size) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const assetsFolder = await getOrCreateFolder(
      "Assets",
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!,
    );
    signatoryImageDriveId = await uploadFile(
      `Signature_${driveTimestamp()}.png`,
      imageFile.type,
      buffer,
      assetsFolder,
    );
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
    signatoryFaculty,
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

  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
}
