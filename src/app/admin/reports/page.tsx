import { prisma } from "@/lib/prisma";
import { resolveActorName } from "@/lib/format";
import { exportInventorySnapshot } from "./actions";
import { AnnualReportPanel } from "./AnnualReportPanel";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/SubmitButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const maxDuration = 60;

export default async function ReportsPage() {
  const recentReports = await prisma.annualReport.findMany({
    include: { creator: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const snapshots = await prisma.inventorySnapshot.findMany({
    include: { creator: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Reports</h1>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <AnnualReportPanel recentReports={recentReports} />

        <Card>
          <CardHeader>
            <CardTitle>Export Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form action={exportInventorySnapshot} className="flex items-end gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  name="label"
                  placeholder="Label (e.g. Post Calang 2026)"
                />
              </div>
              <SubmitButton pendingText="Exporting...">
                Export Snapshot
              </SubmitButton>
            </form>

            {snapshots.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <div className="text-sm font-semibold">Recent Snapshots</div>
                <ul className="flex flex-col gap-2 text-sm">
                  {snapshots.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                    >
                      <span className="text-foreground-2">
                        {s.label} — by {resolveActorName(s.creator, s.creatorName)} —{" "}
                        {s.createdAt.toLocaleDateString("en-GB")}
                      </span>
                      <a
                        href={`https://drive.google.com/file/d/${s.driveFileId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "shrink-0",
                        )}
                      >
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                        Open in Drive
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
