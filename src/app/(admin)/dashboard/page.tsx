import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/admin/require-admin";
import Link from "next/link";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import {
  confirmedExtensionCount,
  getRequestActionLabel,
  requestNeedsAction,
  resolveNickname,
  waitingOnBorrowerLabel,
} from "@/lib/loan/loan-rules";
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
} from "lucide-react";
import { cn, staggerStyle } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { ExtensionBadge } from "@/components/ExtensionBadge";
import { MusicGlyph } from "@/components/MusicGlyph";
import { formatCalendarDate } from "@/lib/format";
import {
  ROSTER_COLUMN_WIDTHS,
  ROSTER_TABLE_CLASS,
  rosterColumnPadding,
} from "./roster-layout";
import { TransferToOngoingButton } from "@/components/TransferToOngoingButton";
import {
  PENDING_REQUEST_STATUSES,
  countTransferableLoans,
  getPendingRequestCount,
} from "@/lib/admin/queries";
import type { Prisma } from "@/generated/prisma/client";

const rosterSelect = {
  id: true,
  status: true,
  carriedOverAt: true,
  borrowerName: true,
  borrowerNickname: true,
  borrowerYear: true,
  borrowerLineId: true,
  instrument: { select: { type: true, serialNumber: true } },
  loanPeriods: {
    select: { sequence: true, startDate: true, dueDate: true },
    orderBy: { sequence: "desc" },
  },
} satisfies Prisma.BorrowingRequestSelect;

const pendingSelect = {
  id: true,
  ticketId: true,
  status: true,
  instrumentConfirmed: true,
  borrowerName: true,
  loanPeriods: {
    select: {
      periodType: true,
      startDate: true,
      actualReturnDate: true,
      addendums: { select: { timing: true } },
    },
    orderBy: { sequence: "desc" },
    take: 1,
  },
} satisfies Prisma.BorrowingRequestSelect;

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  sublabel,
  index,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
  sublabel?: string;
  index: number;
}) {
  return (
    <Card data-stagger style={staggerStyle(index)}>
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
        <div className="flex items-end gap-x-2">
          <div className="tabular text-display">{value}</div>
          {sublabel && (
            <div className="min-w-0 pb-1 text-caption text-muted-foreground">
              {sublabel}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type RosterRow = Prisma.BorrowingRequestGetPayload<{
  select: typeof rosterSelect;
}>;

function loanStartDate(row: RosterRow): Date | null {
  return row.loanPeriods.at(-1)?.startDate ?? null;
}

function currentDueDate(row: RosterRow): Date | null {
  return row.loanPeriods.find((period) => period.startDate)?.dueDate ?? null;
}

function compareByDate(getDate: (row: RosterRow) => Date | null) {
  return (a: RosterRow, b: RosterRow) => {
    const aDate = getDate(a);
    const bDate = getDate(b);
    if (!aDate || !bDate) return aDate ? -1 : bDate ? 1 : 0;
    return aDate.getTime() - bDate.getTime();
  };
}

const ROSTER_LIMIT = 5;

const ROSTER_HEADER_CLASS = "text-micro py-2.5 uppercase text-muted-foreground";

function LoanRosterTable({
  rows,
  lastColumn,
  moreHref,
  moreLabel,
}: {
  rows: RosterRow[];
  lastColumn: "status" | "since";
  moreHref: string;
  moreLabel: string;
}) {
  const visible = rows.slice(0, ROSTER_LIMIT);
  const hiddenCount = rows.length - visible.length;
  return (
    <div className="overflow-x-auto">
      <table className={ROSTER_TABLE_CLASS}>
        <thead>
          <tr className="border-b border-border bg-muted text-left">
            {[
              "Borrower",
              "Year",
              "Instrument",
              "Serial No.",
              "LINE ID",
              lastColumn === "status" ? "Status" : "On loan since",
            ].map((label, index) => (
              <th
                key={label}
                className={cn(
                  ROSTER_HEADER_CLASS,
                  ROSTER_COLUMN_WIDTHS[index],
                  rosterColumnPadding(index),
                )}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((req) => {
            const startDate = loanStartDate(req);
            const showSince =
              lastColumn === "since" && req.status !== "overdue";
            return (
              <tr
                key={req.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/40"
              >
                <td className={cn("py-3", rosterColumnPadding(0))}>
                  <Link
                    href={`/requests/${req.id}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {resolveNickname(req.borrowerName, req.borrowerNickname)}
                  </Link>
                </td>
                <td className="px-4 py-3">{req.borrowerYear}</td>
                <td className="px-4 py-3">{req.instrument?.type}</td>
                <td className="tabular px-4 py-3">
                  {req.instrument?.serialNumber}
                </td>
                <td className="px-4 py-3">{req.borrowerLineId}</td>
                <td className={cn("py-3", rosterColumnPadding(5))}>
                  <div className="flex items-center gap-1.5">
                    {showSince ? (
                      <span className="tabular">
                        {startDate ? formatCalendarDate(startDate) : "—"}
                      </span>
                    ) : (
                      <RequestStatusBadge status={req.status} />
                    )}
                    <ExtensionBadge
                      count={confirmedExtensionCount(req.loanPeriods[0])}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
          {hiddenCount > 0 && (
            <tr>
              <td colSpan={6} className="p-0">
                <Link
                  href={moreHref}
                  className="block px-6 py-3 text-sm font-medium text-foreground-2 transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                  +{hiddenCount} more {moreLabel}
                  {hiddenCount > 1 && "s"}
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function DashboardPage() {
  const [
    session,
    pendingCount,
    activeCount,
    overdueCount,
    needRepairCount,
    activeOngoingCount,
    transferableCount,
    pendingRequests,
    recentActivity,
    activeRequests,
  ] = await Promise.all([
    getSession(),
    getPendingRequestCount(),
    prisma.borrowingRequest.count({
      where: { status: "active" },
    }),
    prisma.borrowingRequest.count({
      where: { status: "overdue" },
    }),
    prisma.instrument.count({
      where: { condition: "need_repair" },
    }),
    prisma.borrowingRequest.count({
      where: { status: "active", carriedOverAt: { not: null } },
    }),
    countTransferableLoans(),
    prisma.borrowingRequest.findMany({
      where: { status: { in: [...PENDING_REQUEST_STATUSES] } },
      select: pendingSelect,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activityLog.findMany({
      include: { admin: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.borrowingRequest.findMany({
      where: { status: { in: ["active", "overdue"] } },
      select: rosterSelect,
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const activeNewCount = activeCount - activeOngoingCount;

  const activeRoster = activeRequests
    .filter((req) => !req.carriedOverAt)
    .sort(compareByDate(loanStartDate));
  const ongoingRoster = activeRequests
    .filter((req) => req.carriedOverAt)
    .sort(compareByDate(currentDueDate));

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
        <p className="text-sm text-foreground-2 lg:mt-1">
          Welcome back, {session?.user.name || session?.user.email}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Request Pending"
          index={0}
          value={pendingCount}
          icon={FileText}
          iconClassName="bg-gold-soft text-gold-soft-foreground"
        />
        <StatCard
          label="Currently Borrowed"
          index={1}
          value={activeCount}
          icon={Clock}
          iconClassName="bg-plum-soft text-plum"
          sublabel={
            activeOngoingCount > 0
              ? `${activeNewCount} new · ${activeOngoingCount} ongoing`
              : undefined
          }
        />
        <StatCard
          label="Overdue"
          index={2}
          value={overdueCount}
          icon={AlertTriangle}
          iconClassName="bg-destructive-soft text-destructive"
        />
        <StatCard
          label="Needs Repair"
          index={3}
          value={needRepairCount}
          icon={Wrench}
          iconClassName="bg-warning-soft text-warning-soft-foreground"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card data-stagger style={staggerStyle(4)}>
          <CardHeader>
            <CardTitle>Requests In Progress</CardTitle>
            <CardAction>
              <Link
                href="/requests"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1 gap-0 px-0">
            {sortedPendingRequests.length === 0 ? (
              <EmptyState
                size="compact"
                className="flex-1"
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
                      <div className="truncate text-xs text-foreground-2">
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
                      href={`/requests/${req.id}`}
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

        <Card data-stagger style={staggerStyle(5)}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardAction>
              <Link
                href="/activity"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="flex-1">
            {recentActivity.length === 0 ? (
              <EmptyState
                size="compact"
                className="flex-1"
                title="No activity yet"
              />
            ) : (
              <ActivityTimeline logs={recentActivity} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card data-stagger style={staggerStyle(6)}>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
          <CardAction>
            <div className="flex gap-2">
              <TransferToOngoingButton transferableCount={transferableCount} />
              <Link
                href="/requests?status=active,overdue"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="gap-0 px-0">
          {activeRoster.length === 0 ? (
            <EmptyState size="compact" title="No active loans right now" />
          ) : (
            <LoanRosterTable
              rows={activeRoster}
              lastColumn="since"
              moreHref="/requests?status=active,overdue"
              moreLabel="active loan"
            />
          )}
        </CardContent>
      </Card>

      {ongoingRoster.length > 0 && (
        <Card data-stagger style={staggerStyle(7)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MusicGlyph
                glyph="fermata"
                className="text-[1.75rem] text-plum"
              />
              Ongoing Loans
            </CardTitle>
            <CardAction>
              <Link
                href="/requests?cohort=ongoing"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="gap-0 px-0">
            <LoanRosterTable
              rows={ongoingRoster}
              lastColumn="status"
              moreHref="/requests?cohort=ongoing"
              moreLabel="ongoing loan"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
