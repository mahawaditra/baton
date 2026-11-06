import { LoadingMarquee } from "@/components/LoadingMarquee";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { TicketCard } from "@/components/TicketCard";

export default function RequestDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <TicketCard
        topTone="hero"
        top={
          <div className="px-6 pt-5 pb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-20 rounded-full bg-hero-fg/15" />
              <Skeleton className="h-3 w-28 bg-hero-fg/15" />
            </div>
            <Skeleton className="mt-3 h-8 w-64 bg-hero-fg/15" />
            <Skeleton className="mt-2 h-4 w-40 bg-hero-fg/15" />
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-hero-fg/15 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-12 bg-hero-fg/15" />
                  <Skeleton className="mt-1.5 h-4 w-28 bg-hero-fg/15" />
                </div>
              ))}
            </div>
          </div>
        }
        bottom={
          <div className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-14" />
                <Skeleton className="mt-1.5 h-4 w-32" />
              </div>
            ))}
          </div>
        }
      />

      <LoadingMarquee />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent className="gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
