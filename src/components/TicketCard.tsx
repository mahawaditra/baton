import { cn } from "@/lib/utils";

const BOTTOM_TONE = {
  card: { surface: "border-border bg-card", outline: "border-border" },
  plum: { surface: "border-plum/25 bg-plum-soft", outline: "border-plum/25" },
  gold: { surface: "border-gold/40 bg-gold-soft", outline: "border-gold/40" },
} as const;

const PERFORATION_POSITIONS = ["25%", "50%", "75%"];

const RING_CLASS = "pointer-events-none absolute rounded-full border";

function NotchOutline({
  edge,
  className,
}: {
  edge: "top" | "bottom";
  className?: string;
}) {
  const ringClass = cn(
    RING_CLASS,
    "size-[calc(2*var(--ticket-notch)+3px)]",
    edge === "top"
      ? "-top-[calc(var(--ticket-notch)+1.5px)]"
      : "-bottom-[calc(var(--ticket-notch)+1.5px)]",
    className,
  );
  return (
    <>
      <span
        aria-hidden
        className={cn(ringClass, "-left-[calc(var(--ticket-notch)+2.5px)]")}
      />
      <span
        aria-hidden
        className={cn(ringClass, "-right-[calc(var(--ticket-notch)+2.5px)]")}
      />
    </>
  );
}

function PerforationOutline({ className }: { className?: string }) {
  return PERFORATION_POSITIONS.map((left) => (
    <span
      key={left}
      aria-hidden
      style={{ left }}
      className={cn(
        RING_CLASS,
        "z-20 hidden size-[calc(2*var(--ticket-perforation)+3px)] -translate-x-1/2 -bottom-[calc(var(--ticket-perforation)+2.5px)] lg:block",
        className,
      )}
    />
  ));
}

export function TicketLabel({
  as = "div",
  htmlFor,
  className,
  children,
}: {
  as?: "div" | "dt" | "label";
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const Element = htmlFor ? "label" : as;
  return (
    <Element
      htmlFor={htmlFor}
      className={cn(
        "text-micro uppercase text-gold dark:text-gold-soft-foreground",
        className,
      )}
    >
      {children}
    </Element>
  );
}

export function TicketCard({
  top,
  bottom,
  topTone = "card",
  bottomTone = "card",
  bottomClassName,
  tearLine = true,
  perforated = false,
  className,
}: {
  top: React.ReactNode;
  bottom?: React.ReactNode;
  topTone?: "card" | "hero";
  bottomTone?: keyof typeof BOTTOM_TONE;
  bottomClassName?: string;
  tearLine?: boolean;
  perforated?: boolean;
  className?: string;
}) {
  const bottomStyle = BOTTOM_TONE[bottomTone];
  return (
    <div
      className={cn("flex flex-col text-sm text-card-foreground", className)}
    >
      <div
        className={cn(
          "relative border",
          bottom ? "ticket-notch-bottom rounded-t-md border-b-0" : "rounded-md",
          perforated && "ticket-perforated",
          topTone === "hero"
            ? "ticket-hero border-transparent bg-hero-bg text-hero-fg"
            : "border-border bg-card",
        )}
      >
        {top}
        {bottom && topTone === "card" && (
          <NotchOutline edge="bottom" className="border-border" />
        )}
      </div>
      {bottom && (
        <div
          className={cn(
            "ticket-notch-top relative rounded-b-md border border-t-0",
            perforated && "ticket-perforated",
            bottomStyle.surface,
            bottomClassName,
          )}
        >
          {tearLine && (
            <div
              aria-hidden
              className="mx-3 border-t-[1.5px] border-dashed border-border-strong"
            />
          )}
          {bottom}
          <NotchOutline edge="top" className={bottomStyle.outline} />
          {perforated && <PerforationOutline className={bottomStyle.outline} />}
        </div>
      )}
    </div>
  );
}
