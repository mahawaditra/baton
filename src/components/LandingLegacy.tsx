import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingLegacy() {
  return (
    <section className="border-t border-border bg-surface px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <h2 className="font-heading text-h2 text-foreground">BATON Legacy</h2>
        <p className="text-body-lg text-foreground-2">
          Every Ketua Logistik eventually hands over the baton. This is the wall
          of everyone who did and a tribute to haseulbintaro&apos;s fellow
          comrades.
        </p>
        <Link
          href="/legacy"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Visit the Legacy
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}
