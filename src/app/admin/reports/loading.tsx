import { LoadingMarquee } from "@/components/LoadingMarquee";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Reports</h1>
      <LoadingMarquee />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Annual Report</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <div className="flex items-end gap-3">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Skeleton className="h-3.5 w-28" />
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
