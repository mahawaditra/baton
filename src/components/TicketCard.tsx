import { cn } from "@/lib/utils";

const BOTTOM_TONE = {
  card: { surface: "border-border bg-card", outline: "border-border" },
  plum: { surface: "border-plum/25 bg-plum-soft", outline: "border-plum/25" },
  gold: { surface: "border-gold/40 bg-gold-soft", outline: "border-gold/40" },
} as const;

function NotchOutline({
  edge,
  className,
}: {
  edge: "top" | "bottom";
  className?: string;
}) {
  const vertical = edge === "top" ? "-top-[11.5px]" : "-bottom-[11.5px]";
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -left-[12.5px] h-[23px] w-[23px] rounded-full border",
          vertical,
          className,
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-[12.5px] h-[23px] w-[23px] rounded-full border",
          vertical,
          className,
        )}
      />
    </>
  );
}

export function TicketLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const className =
    "text-micro uppercase text-gold dark:text-gold-soft-foreground";
  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ) : (
    <div className={className}>{children}</div>
  );
}

export function TicketCard({
  top,
  bottom,
  topTone = "card",
  bottomTone = "card",
  bottomClassName,
  className,
}: {
  top: React.ReactNode;
  bottom?: React.ReactNode;
  topTone?: "card" | "hero";
  bottomTone?: keyof typeof BOTTOM_TONE;
  bottomClassName?: string;
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
            bottomStyle.surface,
            bottomClassName,
          )}
        >
          <div
            aria-hidden
            className="mx-3 border-t-[1.5px] border-dashed border-border-strong"
          />
          {bottom}
          <NotchOutline edge="top" className={bottomStyle.outline} />
        </div>
      )}
    </div>
  );
}
