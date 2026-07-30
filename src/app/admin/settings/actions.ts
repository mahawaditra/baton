"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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
