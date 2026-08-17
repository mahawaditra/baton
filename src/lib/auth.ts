import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "admin",
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
      isActive: {
        type: "boolean",
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
