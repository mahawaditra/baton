import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MUSIC_GLYPH_NAMES, MusicGlyph } from "@/components/MusicGlyph";
import { Reveal } from "@/components/Reveal";
import { TicketLabel } from "@/components/TicketCard";
import { cn } from "@/lib/utils";

const SCORE_MARQUEE =
  "COLOUR × TYPE × NOTICE × TICKET × FIELD × GLYPH × PROGRESS × MOTION ×";

const SWATCHES = [
  "ink-800",
  "plum-700",
  "gold-400",
  "cream-100",
  "sage-500",
  "amber-400",
  "terracotta-500",
  "blue-500",
];

function GlyphRow() {
  return (
    <div className="flex shrink-0 items-center gap-7 pr-7 text-3xl">
      {MUSIC_GLYPH_NAMES.map((glyph) => (
        <MusicGlyph key={glyph} glyph={glyph} inline />
      ))}
    </div>
  );
}

function SpecimenCard({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card px-3 py-2.5",
        className,
      )}
    >
      <div className="mb-2 text-micro text-muted-foreground uppercase">
        {label}
      </div>
      {children}
    </div>
  );
}

export function LandingDesignSystem() {
  return (
    <div className="bg-[linear-gradient(to_bottom,var(--legacy-band),var(--score-band)_6rem,var(--score-band)_calc(100%-6rem),var(--background))]">
      <section className="relative overflow-hidden px-6 pt-20 pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 flex h-24 -translate-y-1/2 flex-col justify-between"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className="h-px bg-score-staff" />
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]"
        >
          <div
            className="marquee-track marquee-l font-heading text-xl font-extrabold tracking-wide text-gold/15 motion-reduce:animate-none dark:text-gold/10"
            style={{ animationDuration: "48s" }}
          >
            <span>{`${SCORE_MARQUEE} ${SCORE_MARQUEE}`}</span>
            <span>{`${SCORE_MARQUEE} ${SCORE_MARQUEE}`}</span>
          </div>
        </div>

        <Reveal className="relative mx-auto grid max-w-4xl grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col items-start gap-3">
            <span className="text-micro text-gold-soft-foreground uppercase">
              Behind the score
            </span>
            <h2 className="font-heading text-h2 text-foreground">
              Design system
            </h2>
            <p className="text-body-lg text-foreground-2">
              The colours, glyphs and components that make BATON read like a
              score, pulled straight from the code.
            </p>
            <Link
              href="/design-system"
              className={cn(
                buttonVariants(),
                "mt-2 bg-gold px-4 text-hero-bg hover:bg-gold-hover",
              )}
            >
              Open the design system
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          <div aria-hidden className="grid grid-cols-2 gap-3">
            <SpecimenCard label="Colour">
              <div className="grid grid-cols-4 gap-1">
                {SWATCHES.map((name) => (
                  <span
                    key={name}
                    className="h-6 rounded-sm border border-border"
                    style={{ background: `var(--${name})` }}
                  />
                ))}
              </div>
            </SpecimenCard>
            <SpecimenCard label="Ticket">
              <div className="overflow-hidden rounded-sm">
                <div className="ticket-hero bg-hero-bg px-2.5 py-1.5 text-hero-fg">
                  <TicketLabel className="text-[0.625rem]">
                    Ticket ID
                  </TicketLabel>
                  <div className="tabular font-heading text-sm font-bold">
                    26999901
                  </div>
                </div>
                <div className="border-t-[1.5px] border-dashed border-gold-soft-foreground/40 bg-gold-soft px-2.5 py-1 text-[0.625rem] font-semibold text-gold-soft-foreground">
                  Giliran kamu
                </div>
              </div>
            </SpecimenCard>
            <SpecimenCard label="Glyph" className="col-span-2">
              <div className="-mx-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]">
                <div
                  className="marquee-track marquee-l h-9 items-center text-gold motion-reduce:animate-none"
                  style={{ animationDuration: "24s" }}
                >
                  <GlyphRow />
                  <GlyphRow />
                </div>
              </div>
            </SpecimenCard>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
