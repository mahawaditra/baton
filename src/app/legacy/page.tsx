import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { SquigglyText } from "@/components/ui/squiggly-text";
import { CrewSection } from "./CrewSection";
import { TombstoneCard } from "./TombstoneCard";

export const revalidate = 300;

export const viewport: Viewport = {
  themeColor: "#11111f",
};

const LEGACY_DESCRIPTION =
  "A tribute to haseulbintaro's fellow comrades, and to every Ketua Logistik who handed over the baton.";

export const metadata: Metadata = {
  title: "BATON Legacy",
  description: LEGACY_DESCRIPTION,
  openGraph: {
    title: "BATON Legacy",
    description: LEGACY_DESCRIPTION,
    siteName: "BATON",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default async function LegacyPage() {
  const tombstones = await prisma.tombstone.findMany({
    where: { photoDriveFileId: { not: null } },
    orderBy: [{ termYear: "asc" }, { createdAt: "asc" }],
  });

  return (
    <AuroraBackground>
      <main className="px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[112rem] flex-col gap-16">
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 self-start text-caption text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              Back to BATON
            </Link>
            <h1 className="font-heading text-h1 text-foreground">
              <EncryptedText
                text="BATON Legacy"
                revealDelayMs={70}
                encryptedClassName="text-gold/80"
                revealedClassName="text-foreground"
              />
            </h1>
            <p className="max-w-xl text-center text-body text-foreground-2 italic [text-shadow:0_0_12px_var(--background),0_0_3px_var(--background)]">
              A tribute to haseulbintaro&apos;s fellow Logistik comrades.
            </p>
          </div>

          <CrewSection />

          <div
            aria-hidden
            className="h-px bg-linear-to-r from-transparent via-gold/60 to-transparent"
          />

          <section className="flex flex-col items-center gap-12">
            <h2 className="font-heading text-h2 text-foreground">
              BATON{" "}
              <SquigglyText
                scale={[2.5, 3.5]}
                stepDuration={100}
                className="text-[oklch(0.58_0.22_27)] [text-shadow:0_0_18px_oklch(0.5_0.22_27/0.55)]"
              >
                Sacrifices
              </SquigglyText>
            </h2>
            {tombstones.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div
                  aria-hidden
                  className="legacy-emblem aspect-[1146/1820] h-24 opacity-80"
                />
                <p className="text-body-lg text-foreground-2">
                  No sacrifices have been made yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-6">
                {tombstones.map((tombstone) => (
                  <TombstoneCard key={tombstone.id} tombstone={tombstone} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AuroraBackground>
  );
}
