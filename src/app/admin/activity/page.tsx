import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatActivityLog,
  getEntityUrl,
  toJakartaCalendarDate,
  todayInJakarta,
} from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityLog, Admin } from "@/generated/prisma/client";

const PAGE_SIZE = 30;

const ENTITY_TYPE_LABEL: Record<string, string> = {
  goods: "Goods",
  loan_settings: "Loan Settings",
  admin: "Admin",
  inventory_snapshot: "Snapshot",
  loan_period: "Loan Period",
};

function groupLogsByDay(logs: (ActivityLog & { admin: Admin })[]) {
  const today = todayInJakarta();
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const groups = new Map<
    string,
    { label: string; logs: (ActivityLog & { admin: Admin })[] }
  >();

  for (const log of logs) {
    const day = toJakartaCalendarDate(log.createdAt);
    const key = day.toISOString();

    let label: string;
    if (day.getTime() === today.getTime()) {
      label = "Hari ini";
    } else if (day.getTime() === yesterday.getTime()) {
      label = "Kemarin";
    } else {
      label = day.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    if (!groups.has(key)) {
      groups.set(key, { label, logs: [] });
    }
    groups.get(key)!.logs.push(log);
  }

  return [...groups.values()];
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      include: { admin: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const requestIds = [
    ...new Set(
      logs
        .filter((l) => l.entityType === "borrowing_request")
        .map((l) => l.entityId),
    ),
  ];
  const instrumentIds = [
    ...new Set(
      logs.filter((l) => l.entityType === "instrument").map((l) => l.entityId),
    ),
  ];

  const [requests, instruments] = await Promise.all([
    requestIds.length > 0
      ? prisma.borrowingRequest.findMany({
          where: { id: { in: requestIds } },
          select: { id: true, ticketId: true },
        })
      : [],
    instrumentIds.length > 0
      ? prisma.instrument.findMany({
          where: { id: { in: instrumentIds } },
          select: { id: true, type: true },
        })
      : [],
  ]);

  const requestMap = new Map(requests.map((r) => [r.id, r.ticketId]));
  const instrumentMap = new Map(instruments.map((i) => [i.id, i.type]));

  function entityTag(log: ActivityLog): string {
    if (log.entityType === "borrowing_request") {
      return requestMap.get(log.entityId) ?? "Request";
    }
    if (log.entityType === "instrument") {
      return instrumentMap.get(log.entityId) ?? "Instrument";
    }
    return ENTITY_TYPE_LABEL[log.entityType] ?? log.entityType;
  }

  const groupedLogs = groupLogsByDay(logs);

  return (
    <div className="flex flex-col gap-6 pb-20">
      <h1 className="text-h1">Activity Log</h1>

      {logs.length === 0 ? (
        <EmptyState icon={Activity} title="No activity recorded yet" />
      ) : (
        <div className="flex flex-col gap-6">
          {groupedLogs.map((group) => (
            <div key={group.label} className="flex flex-col gap-3">
              <div className="text-sm font-semibold text-foreground-2">
                {group.label}
              </div>
              <div className="relative flex flex-col gap-3.5">
                <div className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-muted" />
                {group.logs.map((log) => {
                  const url = getEntityUrl(log.entityType, log.entityId);
                  const content = (
                    <>
                      <span className="font-semibold">{log.admin.name}</span>{" "}
                      {formatActivityLog(log)}
                    </>
                  );
                  return (
                    <div key={log.id} className="flex gap-3.5">
                      <span className="relative z-10 mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-surface bg-navy" />
                      <div>
                        <div className="text-sm">
                          {url ? (
                            <Link href={url} className="hover:underline">
                              {content}
                            </Link>
                          ) : (
                            content
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="tabular">
                            {log.createdAt.toLocaleString("id-ID", {
                              timeStyle: "short",
                            })}
                          </span>
                          <span className="tabular rounded-sm bg-muted px-1.5 py-0.5 font-medium">
                            {entityTag(log)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed right-0 bottom-0 left-60 z-10 flex items-center justify-between border-t border-border bg-surface px-6 py-4">
        <Link
          href={`/admin/activity?page=${page - 1}`}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Prev
        </Link>
        <span className="tabular text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Link
          href={`/admin/activity?page=${page + 1}`}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page >= totalPages && "pointer-events-none opacity-50",
          )}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
