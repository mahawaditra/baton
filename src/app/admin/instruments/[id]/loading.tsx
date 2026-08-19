import { LoadingMarquee } from "@/components/LoadingMarquee";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "peminjam", label: "Borrower History" },
  { key: "kondisi", label: "Condition History" },
  { key: "addendum", label: "Addendum" },
  { key: "aktivitas", label: "Activity" },
] as const;

export default function InstrumentDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>

      <LoadingMarquee />

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-1.5 h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="-mx-6 flex gap-1 overflow-x-auto border-b border-border px-6">
          {TABS.map((t, i) => (
            <span
              key={t.key}
              className={cn(
                "shrink-0 px-5 py-3.5 text-sm whitespace-nowrap text-muted-foreground",
                i === 0 && "-mb-px border-b-2 border-navy font-semibold",
              )}
            >
              {t.label}
            </span>
          ))}
        </div>
        <CardContent className="gap-3 pt-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
