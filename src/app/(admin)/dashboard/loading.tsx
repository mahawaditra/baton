import { LoadingMarquee } from "@/components/LoadingMarquee";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ROSTER_COLUMN_WIDTHS,
  ROSTER_TABLE_CLASS,
  rosterColumnPadding,
} from "./roster-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <LoadingMarquee />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="gap-3">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
              <Skeleton className="h-9 w-14" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Requests In Progress</CardTitle>
          </CardHeader>
          <CardContent className="gap-0 px-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border px-6 py-3.5 last:border-b-0"
              >
                <Skeleton className="h-3 w-12 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
        </CardHeader>
        <CardContent className="gap-0 px-0">
          <div className="overflow-x-auto">
            <table className={ROSTER_TABLE_CLASS}>
              <thead>
                <tr className="border-b border-border bg-muted">
                  {ROSTER_COLUMN_WIDTHS.map((width, index) => (
                    <th
                      key={width + index}
                      className={cn(width, rosterColumnPadding(index), "py-3")}
                    >
                      <Skeleton className="h-2.5 w-3/5" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, row) => (
                  <tr
                    key={row}
                    className="border-b border-border last:border-b-0"
                  >
                    {ROSTER_COLUMN_WIDTHS.map((width, index) => (
                      <td
                        key={width + index}
                        className={cn(rosterColumnPadding(index), "py-3.5")}
                      >
                        <Skeleton className="h-3 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
