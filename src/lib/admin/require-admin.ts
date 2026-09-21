import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type AppSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export function isServingAdmin(
  session: AppSession | null,
): session is AppSession {
  return (
    session !== null && session.user.isActive && !session.user.handoverAt
  );
}

export async function getAdminSession(): Promise<AppSession | null> {
  const session = await getSession();
  return isServingAdmin(session) ? session : null;
}

export async function requireAdmin(): Promise<AppSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("Not logged in");
  return session;
}
