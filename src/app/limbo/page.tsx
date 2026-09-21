import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LimboForm } from "./LimboForm";

export const metadata: Metadata = {
  title: "The sacrifice is made.",
  robots: { index: false, follow: false },
};

export default async function LimboPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user.isActive) redirect("/");
  if (session.user.role !== "ketua" || !session.user.handoverAt) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <h1 className="font-heading text-h1 text-foreground">
          The sacrifice is made.
        </h1>
        <p className="text-body-lg text-foreground-2">
          Your comrades have been offered up. Every eclipse they spent alongside
          you, working hard for Mahawaditra, is remembered — thank you for your
          patronage. I hope you never regret this. One offering remains, and it
          is yours. Leave a piece of your soul, and your name will outlive your
          access. There is no undoing this.
        </p>
        <LimboForm />
      </div>
    </main>
  );
}
