import { prisma } from "@/lib/prisma";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Users, History, ClipboardList, Activity } from "lucide-react";

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
        title="Belum ada riwayat peminjaman"
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
        title="Belum ada perubahan kondisi tercatat"
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
        title="Belum ada addendum"
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
  const logs = await prisma.activityLog.findMany({
    where: {
      entityType: "instrument",
      entityId: instrumentId,
    },
    include: { admin: true },
    orderBy: { createdAt: "desc" },
  });

  if (logs.length === 0) {
    return (
      <EmptyState icon={Activity} size="compact" title="Belum ada aktivitas" />
    );
  }

  return <ActivityTimeline logs={logs} linkEntities={false} />;
}
