import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BarlineHeading } from "@/components/BarlineHeading";
import { HeroMarquee } from "@/components/HeroMarquee";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export function LandingLegacy() {
  return (
    <div className="bg-[linear-gradient(to_bottom,var(--surface),var(--legacy-band)_6rem)]">
      <section className="relative isolate px-6 py-20 [clip-path:inset(0)] [mask-image:linear-gradient(to_bottom,transparent,#000_20%,#000_85%,transparent)]">
        <HeroMarquee textClassName="text-plum/6 dark:text-plum/10" />
        <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <BarlineHeading className="text-plum dark:text-gold">
            BATON Legacy
          </BarlineHeading>
          <p className="text-body-lg text-foreground-2">
            Every Ketua Logistik eventually hands over the baton. This is the
            wall of everyone who did and a tribute to haseulbintaro&apos;s
            fellow comrades.
          </p>
          <Link
            href="/legacy"
            className={cn(
              buttonVariants(),
              "bg-plum px-4 text-background hover:bg-plum/90",
            )}
          >
            Visit the Legacy
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
