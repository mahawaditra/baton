import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { getRequestActionLabel, requestNeedsAction } from "@/lib/loan-rules";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  Clock,
  FileText,
  LucideIcon,
  Wrench,
  Inbox,
  Activity,
  PackageOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

function waitingOnBorrowerLabel(status: string): string {
  switch (status) {
    case "contract_generated":
      return "Waiting for borrower to upload documents";
    case "reviewing":
      return "Waiting for borrower to complete Stage 2";
    case "ready_to_pickup":
      return "Waiting for pickup";
    default:
      return "Waiting on borrower";
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
}) {
  return (
    <Card>
      <CardContent className="gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 text-caption uppercase text-foreground-2">
            {label}
          </div>
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              iconClassName,
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        </div>
        <div className="tabular text-display">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const [pendingCount, activeCount, overdueCount, needRepairCount] =
    await Promise.all([
      prisma.borrowingRequest.count({
        where: {
          status: {
            in: [
              "submitted",
              "reviewing",
              "contract_generated",
              "documents_uploaded",
              "ready_to_pickup",
            ],
          },
        },
      }),
      prisma.borrowingRequest.count({
        where: { status: "active" },
      }),
      prisma.borrowingRequest.count({
        where: { status: "overdue" },
      }),
      prisma.instrument.count({
        where: { condition: "need_repair" },
      }),
    ]);

  const [pendingRequests, recentActivity, activeRequests] = await Promise.all([
    prisma.borrowingRequest.findMany({
      where: {
        status: {
          in: [
            "submitted",
            "reviewing",
            "contract_generated",
            "documents_uploaded",
            "ready_to_pickup",
          ],
        },
      },
      include: {
        loanPeriods: {
          orderBy: { sequence: "desc" },
          take: 1,
          include: { addendums: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    prisma.activityLog.findMany({
      include: { admin: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.borrowingRequest.findMany({
      where: { status: { in: ["active", "overdue"] } },
      include: {
        instrument: true,
        loanPeriods: {
          orderBy: {
            sequence: "desc",
          },
          take: 1,
        },
      },
    }),
  ]);

  const activeRoster = activeRequests
    .map((req) => ({
      ...req,
      dueDate: req.loanPeriods[0]?.dueDate ?? null,
    }))
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    })
    .slice(0, 5);

  const sortedPendingRequests = [...pendingRequests].sort((a, b) => {
    const aNeeds = requestNeedsAction(a);
    const bNeeds = requestNeedsAction(b);
    if (aNeeds === bNeeds) return 0;
    return aNeeds ? -1 : 1;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="hidden text-h1 lg:block">Dashboard</h1>
        <p className="text-sm text-muted-foreground lg:mt-1">
          Welcome back, {session?.user.name || session?.user.email}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Request Pending"
          value={pendingCount}
          icon={FileText}
          iconClassName="bg-gold-soft text-gold-soft-foreground"
        />
        <StatCard
          label="Currently Borrowed"
          value={activeCount}
          icon={Clock}
          iconClassName="bg-plum-soft text-plum"
        />
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          iconClassName="bg-destructive-soft text-destructive"
        />
        <StatCard
          label="Needs Repair"
          value={needRepairCount}
          icon={Wrench}
          iconClassName="bg-warning-soft text-warning-soft-foreground"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Requests In Progress</CardTitle>
            <CardAction>
              <Link
                href="/admin/requests"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="gap-0 px-0">
            {sortedPendingRequests.length === 0 ? (
              <EmptyState
                icon={Inbox}
                size="compact"
                title="No requests in progress"
                description="New submissions from the public form will show up here."
              />
            ) : (
              sortedPendingRequests.map((req) => {
                const needsAction = requestNeedsAction(req);
                return (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 border-b border-border px-6 py-3.5 last:border-b-0"
                  >
                    <span className="tabular w-16 shrink-0 text-xs font-semibold text-muted-foreground lg:w-20">
                      {req.ticketId}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {needsAction && (
                          <CircleAlert
                            className="h-3.5 w-3.5 shrink-0 text-gold-soft-foreground"
                            strokeWidth={2}
                            aria-label="Needs action"
                          />
                        )}
                        <span className="truncate text-sm font-semibold">
                          {req.borrowerName}
                        </span>
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {needsAction
                          ? getRequestActionLabel(req)
                          : waitingOnBorrowerLabel(req.status)}
                      </div>
                      <div className="mt-2 lg:hidden">
                        <RequestStatusBadge status={req.status} />
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <RequestStatusBadge status={req.status} />
                    </div>
                    <Link
                      href={`/admin/requests/${req.id}`}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Review
                    </Link>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardAction>
              <Link
                href="/admin/activity"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={Activity}
                size="compact"
                title="No activity yet"
              />
            ) : (
              <ActivityTimeline logs={recentActivity} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
          <CardAction>
            <Link
              href="/admin/requests?status=active,overdue"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="gap-0 px-0">
          {activeRoster.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              size="compact"
              title="No active loans right now"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted text-left">
                    <th className="text-micro px-6 py-2.5 uppercase text-muted-foreground">
                      Borrower
                    </th>
                    <th className="text-micro px-4 py-2.5 uppercase text-muted-foreground">
                      Year
                    </th>
                    <th className="text-micro px-4 py-2.5 uppercase text-muted-foreground">
                      Instrument
                    </th>
                    <th className="text-micro px-4 py-2.5 uppercase text-muted-foreground">
                      Serial No.
                    </th>
                    <th className="text-micro px-4 py-2.5 uppercase text-muted-foreground">
                      LINE ID
                    </th>
                    <th className="text-micro px-6 py-2.5 uppercase text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeRoster.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/40"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/requests/${req.id}`}
                          className="font-medium text-navy hover:underline"
                        >
                          {req.borrowerName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{req.borrowerYear}</td>
                      <td className="px-4 py-3">{req.instrument?.type}</td>
                      <td className="tabular px-4 py-3">
                        {req.instrument?.serialNumber}
                      </td>
                      <td className="px-4 py-3">{req.borrowerLineId}</td>
                      <td className="px-6 py-3">
                        <RequestStatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
