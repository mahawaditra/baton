import { ChevronDown } from "lucide-react";

export function HandbookAccordionRow({
  summary,
  defaultOpen = false,
  children,
}: {
  summary: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="details-animated group border-b border-border last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">{summary}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-250 group-open:rotate-180 motion-reduce:transition-none"
          strokeWidth={1.75}
        />
      </summary>
      <div className="flex flex-col gap-3 px-4 pb-4 text-sm text-foreground-2 sm:px-5">
        {children}
      </div>
    </details>
  );
}
