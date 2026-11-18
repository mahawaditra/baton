import { Disclosure } from "@/components/Disclosure";

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
    <Disclosure
      defaultOpen={defaultOpen}
      className="border-b border-border last:border-b-0"
      summaryClassName="px-4 py-3 hover:bg-muted/50 focus-visible:ring-inset sm:px-5"
      summary={<span className="min-w-0 flex-1">{summary}</span>}
    >
      <div className="flex flex-col gap-3 px-4 pb-4 text-sm text-foreground-2 sm:px-5">
        {children}
      </div>
    </Disclosure>
  );
}
