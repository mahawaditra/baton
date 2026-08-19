import { Skeleton } from "@/components/ui/skeleton";

export function TableRowsSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="h-10 rounded-t-lg border-b border-border bg-muted" />
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex h-12 items-center gap-6 px-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
