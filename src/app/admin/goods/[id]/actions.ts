"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateGood(id: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Not logged in");

  const before = await prisma.good.findUniqueOrThrow({ where: { id } });

  const updated = await prisma.good.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      quantity: Number(formData.get("quantity")),
      condition: formData.get("condition") as any,
      location: formData.get("location") as string,
      registrationNo: formData.get("registrationNo") as string,
      notes: formData.get("notes") as string,
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
  redirect(`/admin/goods/${id}`);
}
