import { prisma } from "@/lib/prisma";

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
    return <p>No borrowing history yet.</p>;
  }

  return (
    <ul>
      {requests.map((req) => (
        <li key={req.id}>
          <strong>{req.borrowerName}</strong> ({req.borrowerYear}) —{" "}
          {req.status}
          <br />
          Contact: {req.borrowerPhone} · LINE: {req.borrowerLineId}
          <br />
          Periods: {req.loanPeriods.length}
        </li>
      ))}
    </ul>
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
    return <p>No condition changes recorded yet.</p>;
  }

  return (
    <ul>
      {logs.map((log) => (
        <li key={log.id}>
          {log.admin.name} — {log.createdAt.toLocaleDateString()}
          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
        </li>
      ))}
    </ul>
  );
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
    return <p>No addendums submitted yet.</p>;
  }

  return (
    <ul>
      {addendums.map((a) => (
        <li key={a.id}>
          {a.timing} — {a.bodyCondition}
          <br />
          Photos: {a.driveFileIds.length}
        </li>
      ))}
    </ul>
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
    return <p>No activity recorded yet.</p>;
  }

  return (
    <ul>
      {logs.map((log) => (
        <li key={log.id}>
          {log.admin.name} — {log.action} — {log.createdAt.toLocaleString()}
        </li>
      ))}
    </ul>
  );
}
