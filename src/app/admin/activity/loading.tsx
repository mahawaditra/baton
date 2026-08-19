import { LoadingMarquee } from "@/components/LoadingMarquee";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <div className="flex flex-col gap-6 pb-20">
      <h1 className="text-h1">Activity Log</h1>
      <LoadingMarquee />

      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex} className="flex flex-col gap-3">
            <Skeleton className="h-3.5 w-16" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-10 flex items-center justify-between border-t border-border bg-surface px-6 py-4 lg:left-60">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}
