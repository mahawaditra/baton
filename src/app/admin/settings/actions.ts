"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getOrCreateFolder, uploadFile } from "@/lib/drive";
import { driveTimestamp } from "@/lib/format";

export async function addAdmin(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user.role !== "super_admin") {
    throw new Error("Only super admin can add new admin");
  }

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email || !name) {
    throw new Error("Email and name are required");
  }

  const newAdmin = await prisma.admin.create({
    data: { email, name },
  });

  await prisma.activityLog.create({
    data: {
      adminId: session.user.id,
      action: "add_admin",
      entityType: "admin",
      entityId: newAdmin.id,
    },
  });

  revalidatePath("/admin/settings");
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
