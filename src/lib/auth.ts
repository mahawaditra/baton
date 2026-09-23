import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { ADMIN_URL } from "@/lib/admin/admin-host";

export const auth = betterAuth({
  baseURL: ADMIN_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "admin",
    additionalFields: {
      role: {
        type: ["staff", "pengurus", "ketua", "overlord"],
        input: false,
      },
      isActive: {
        type: "boolean",
        input: false,
      },
      handoverAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  session: {
    modelName: "session",
    fields: {
      userId: "adminId",
    },
  },
  account: {
    modelName: "account",
    fields: {
      userId: "adminId",
    },
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      disableImplicitSignUp: true,
    },
  },
});
