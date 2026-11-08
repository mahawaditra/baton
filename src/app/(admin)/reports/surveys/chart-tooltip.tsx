export const CHART_TOOLTIP_CLASS =
  "pointer-events-none z-10 w-max max-w-48 rounded-md border border-border bg-popover px-2.5 py-1.5 text-caption text-foreground-2 shadow-md";

export function TooltipValue({ children }: { children: React.ReactNode }) {
  return (
    <div className="tabular text-label font-semibold text-foreground">
      {children}
    </div>
  );
}
