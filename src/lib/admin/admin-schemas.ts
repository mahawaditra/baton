import { z } from "zod";
import { adminEmailSchema } from "@/lib/admin/email";

export const ADMIN_NAME_MAX_LENGTH = 100;

export const addAdminSchema = z.object({
  email: adminEmailSchema,
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(ADMIN_NAME_MAX_LENGTH),
  role: z.enum(["staff", "ketua"], "Invalid role"),
});

export const handoverSchema = addAdminSchema.pick({ email: true, name: true });
