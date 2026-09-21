"use server";

import { redirect, RedirectType } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";
import { getLegacyFolder, trashFile, uploadFile } from "@/lib/files/drive";
import { validateImageUpload } from "@/lib/files/file-validation";
import { runCompleteHandover } from "@/lib/admin/handover";

export type CompleteHandoverState = { error: string | null };

async function trashQuietly(fileId: string) {
  try {
    await trashFile(fileId);
  } catch {}
}

export async function completeHandover(
  formData: FormData,
): Promise<CompleteHandoverState> {
  const session = await getSession();

  if (
    !session ||
    !session.user.isActive ||
    session.user.role !== "ketua" ||
    !session.user.handoverAt
  ) {
    return { error: "There is no handover in progress for this account." };
  }

  const photo = formData.get("photo");
  const file = photo instanceof File ? photo : null;
  const validation = await validateImageUpload(file);
  if (!file || !validation.valid) {
    return {
      error:
        "That photo doesn't look like a JPEG or PNG under 4MB. Pick another one.",
    };
  }

  const tombstone = await prisma.tombstone.findFirst({
    where: { ketuaAdminId: session.user.id, photoDriveFileId: null },
    select: { id: true, termYear: true },
  });
  if (!tombstone) {
    return { error: "This handover has already been completed." };
  }

  const extension = validation.mimeType === "image/png" ? "png" : "jpg";
  const folderId = await getLegacyFolder("Ketua");
  const driveFileId = await uploadFile(
    `Ketua_${tombstone.termYear}_${tombstone.id}.${extension}`,
    validation.mimeType,
    Buffer.from(await file.arrayBuffer()),
    folderId,
  );

  let result: { error: string | null };
  try {
    result = await prisma.$transaction(
      (tx) =>
        runCompleteHandover(tx, {
          adminId: session.user.id,
          tombstoneId: tombstone.id,
          driveFileId,
        }),
      { timeout: 30_000, maxWait: 10_000 },
    );
  } catch (err) {
    await trashQuietly(driveFileId);
    throw err;
  }

  if (result.error) {
    await trashQuietly(driveFileId);
    return { error: result.error };
  }

  revalidatePath("/legacy");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/activity");
  redirect("/legacy", RedirectType.replace);
}
