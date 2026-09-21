import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/require-admin";
import { LimboForm } from "./LimboForm";
import { LimboShell } from "./LimboShell";

export const maxDuration = 30;

export const viewport: Viewport = {
  themeColor: "#11111f",
};

export const metadata: Metadata = {
  title: "The sacrifice is made.",
  robots: { index: false, follow: false },
};

export default async function LimboPage() {
  const session = await getSession();

  if (!session || !session.user.isActive) redirect("/");
  if (session.user.role !== "ketua" || !session.user.handoverAt) {
    redirect("/admin/dashboard");
  }

  return (
    <LimboShell>
      <LimboForm />
    </LimboShell>
  );
}
