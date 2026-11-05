import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { HeroMarquee } from "@/components/HeroMarquee";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export function LandingLegacy() {
  return (
    <section className="relative isolate bg-plum-soft px-6 py-12 [clip-path:inset(0)]">
      <HeroMarquee textClassName="text-plum/5 dark:text-plum/10" />
      <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <h2 className="font-heading text-h2 text-plum dark:text-gold">
          BATON Legacy
        </h2>
        <p className="text-body-lg text-foreground-2">
          Every Ketua Logistik eventually hands over the baton. This is the wall
          of everyone who did and a tribute to haseulbintaro&apos;s fellow
          comrades.
        </p>
        <Link
          href="/legacy"
          className={cn(
            buttonVariants(),
            "bg-plum px-4 text-background hover:bg-plum/90",
          )}
        >
          Visit the Legacy
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </Reveal>
    </section>
  );
}
