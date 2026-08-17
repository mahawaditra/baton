import { prisma } from "@/lib/prisma";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Users, History, ClipboardList, Activity } from "lucide-react";
import type { ActivityAction } from "@/generated/prisma/client";

const INSTRUMENT_RELEVANT_REQUEST_ACTIONS: ActivityAction[] = [
  "assign_instrument",
  "reject_request",
  "cancel_request",
  "confirm_handover",
  "confirm_return",
];

export async function RiwayatPeminjam({
  instrumentId,
}: {
  instrumentId: string;
}) {
  const requests = await prisma.borrowingRequest.findMany({
    where: { instrumentId },
    include: { loanPeriods: true },
    orderBy: { createdAt: "desc" },
  });

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Users}
        size="compact"
        title="No borrowing history yet"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => (
        <div key={req.id} className="rounded-md border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">
              {req.borrowerName}{" "}
              <span className="font-normal text-muted-foreground">
                ({req.borrowerYear})
              </span>
            </div>
            <RequestStatusBadge status={req.status} />
          </div>
          <div className="mt-1.5 text-xs text-muted-foreground">
            {req.borrowerPhone} · LINE {req.borrowerLineId} ·{" "}
            {req.loanPeriods.length} periode
          </div>
        </div>
      ))}
    </div>
  );
}

export async function RiwayatKondisi({
  instrumentId,
}: {
  instrumentId: string;
}) {
  const logs = await prisma.activityLog.findMany({
    where: {
      entityType: "instrument",
      entityId: instrumentId,
      action: "update_instrument",
    },
    include: { admin: true },
    orderBy: { createdAt: "desc" },
  });

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={History}
        size="compact"
        title="No condition changes recorded yet"
      />
    );
  }

  return <ActivityTimeline logs={logs} linkEntities={false} />;
}

export async function RiwayatAddendum({
  instrumentId,
}: {
  instrumentId: string;
}) {
  const addendums = await prisma.addendum.findMany({
    where: { period: { request: { instrumentId } } },
    orderBy: { submittedAt: "desc" },
  });

  if (addendums.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        size="compact"
        title="No addendums yet"
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {addendums.map((a) => (
        <div key={a.id} className="rounded-md border border-border p-3">
          <div className="text-sm font-semibold capitalize">{a.timing}</div>
          <div className="mt-1 text-sm text-foreground-2">
            {a.bodyCondition}
          </div>
          <div className="mt-1.5 text-xs text-muted-foreground">
            {a.driveFileIds.length} foto
          </div>
        </div>
      ))}
    </div>
  );
}

export async function RiwayatAktivitas({
  instrumentId,
}: {
  instrumentId: string;
}) {
  const relatedRequests = await prisma.borrowingRequest.findMany({
    where: { instrumentId },
    select: { id: true, ticketId: true },
  });
  const ticketTags = new Map(relatedRequests.map((r) => [r.id, r.ticketId]));

  const logs = await prisma.activityLog.findMany({
    where: {
      OR: [
        { entityType: "instrument", entityId: instrumentId },
        {
          entityType: "borrowing_request",
          entityId: { in: relatedRequests.map((r) => r.id) },
          action: { in: INSTRUMENT_RELEVANT_REQUEST_ACTIONS },
        },
      ],
    },
    include: { admin: true },
    orderBy: { createdAt: "desc" },
  });

  if (logs.length === 0) {
    return (
      <EmptyState icon={Activity} size="compact" title="No activity yet" />
    );
  }

  return <ActivityTimeline logs={logs} tags={ticketTags} />;
}
