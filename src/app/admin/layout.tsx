import { AdminNav } from "./AdminNav";
import { BackToTopButton } from "@/components/BackToTopButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user.isActive) {
    return <>{children}</>;
  }

  const pendingCount = await prisma.borrowingRequest.count({
    where: {
      status: {
        in: [
          "submitted",
          "reviewing",
          "contract_generated",
          "documents_uploaded",
          "ready_to_pickup",
        ],
      },
    },
  });
  return (
    <div className="flex min-h-screen">
      <AdminNav
        pendingCount={pendingCount}
        adminName={session?.user.name ?? ""}
        adminEmail={session?.user.email ?? ""}
      />
      <main className="flex-1 p-6">{children}</main>
      <div
        aria-hidden
        className="pointer-events-none fixed right-0 bottom-0 left-60 -z-10 overflow-hidden select-none"
      >
        <span
          className="font-heading block text-center text-[clamp(6rem,22vw,18rem)] leading-none font-extrabold tracking-tighter text-navy/[0.09]"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 70%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 70%)",
          }}
        >
          BATON
        </span>
      </div>
      <BackToTopButton />
    </div>
  );
}
