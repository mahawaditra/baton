"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getOrCreateFolder, uploadFile } from "@/lib/drive";
import { driveTimestamp } from "@/lib/format";
import { Prisma } from "@/generated/prisma/client";

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
  return { success: true, error: null };
}

export async function updateLoanSettings(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Not logged in");

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
    dueDate: new Date(formData.get("dueDate") as string),
    depositAmount: Number(formData.get("depositAmount")),
    depositPartialAmount: Number(formData.get("depositPartialAmount")),
    depositGraceDays: Number(formData.get("depositGraceDays")),
    bankName: formData.get("bankName") as string,
    bankAccount: formData.get("bankAccount") as string,
    bankHolder: formData.get("bankHolder") as string,
    updatedBy: session.user.id,

    signatoryName: formData.get("signatoryName") as string,
    signatoryPhone: formData.get("signatoryPhone") as string,
    signatoryLineId: formData.get("signatoryLineId") as string,
    signatoryAddressKtp: formData.get("signatoryAddressKtp") as string,
    signatoryAddressDomicile: formData.get(
      "signatoryAddressDomicile",
    ) as string,
    signatoryFaculty: formData.get("signatoryFaculty") as string,
    signatoryYear: formData.get("signatoryYear") as string,
    signatorySection: formData.get("signatorySection") as string,
    signatoryKtpNumber: formData.get("signatoryKtpNumber") as string,
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
}
