import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function DisclosureChevron({ className }: { className?: string }) {
  return (
    <ChevronDown
      aria-hidden
      className={cn(
        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.2,0,0,1)] group-open/disclosure:rotate-180 motion-reduce:transition-none",
        className,
      )}
      strokeWidth={1.75}
    />
  );
}

export function Disclosure({
  summary,
  defaultOpen = false,
  chevron = true,
  className,
  summaryClassName,
  children,
}: {
  summary: React.ReactNode;
  defaultOpen?: boolean;
  chevron?: boolean;
  className?: string;
  summaryClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn("disclosure group/disclosure", className)}
    >
      <summary
        className={cn(
          "flex cursor-(--cursor-link) list-none items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden",
          summaryClassName,
        )}
      >
        {summary}
        {chevron && <DisclosureChevron className="ml-auto" />}
      </summary>
      <div className="flow-root">{children}</div>
    </details>
  );
}
