import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { formatActivityLog, getEntityUrl } from "@/lib/format";

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", flex: 1 }}>
      <p style={{ fontSize: "0.85em", color: "#666" }}>{label}</p>
      <p style={{ fontSize: "2em", fontWeight: "bold" }}>{value}</p>
    </div>
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

  const needsAction = await prisma.borrowingRequest.findMany({
    where: {
      OR: [
        { status: "submitted" },
        { status: "reviewing", instrumentConfirmed: false },
        { status: "documents_uploaded" },
        {
          status: "ready_to_pickup",
          loanPeriods: {
            some: { addendums: { some: { timing: "initial" } } },
          },
        },
        {
          status: "active",
          loanPeriods: {
            some: {
              periodType: "extension",
              startDate: null,
              addendums: { some: { timing: "initial" } },
            },
          },
        },
        {
          status: "active",
          loanPeriods: {
            some: {
              actualReturnDate: null,
              addendums: { some: { timing: "final" } },
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentActivity = await prisma.activityLog.findMany({
    include: { admin: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const activeRequests = await prisma.borrowingRequest.findMany({
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
  });

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

  function getActionLabel(req: {
    status: string;
    instrumentConfirmed: boolean;
  }): string {
    if (req.status === "submitted") {
      return "Needs instrument assignment";
    }
    if (req.status === "reviewing" && !req.instrumentConfirmed) {
      return "Needs confirmation";
    }
    if (req.status === "documents_uploaded") {
      return "Needs document review";
    }
    return "Needs handover confirmation";
  }

  return (
    <div>
      <h1>Dashboard Admin BATON</h1>
      <p>Login sebagai: {session?.user.email}</p>

      <div style={{ display: "flex", gap: "16px" }}>
        <SummaryCard label="Request Pending" value={pendingCount} />
        <SummaryCard label="Sedang Dipinjam" value={activeCount} />
        <SummaryCard label="Overdue" value={overdueCount} />
        <SummaryCard label="Butuh Reparasi" value={needRepairCount} />
      </div>
      <div>
        <h2>Requests Needing Action</h2>
        {needsAction.length === 0 ? (
          <p>Nothing needs your attention right now.</p>
        ) : (
          <ul>
            {needsAction.map((req) => (
              <li key={req.id}>
                <Link href={`/admin/requests/${req.id}`}>
                  {req.borrowerName} — {req.ticketId}
                </Link>{" "}
                — {getActionLabel(req)}
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/requests">Lihat semua →</Link>
      </div>
      <div>
        <h2>Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          <ul>
            {recentActivity.map((log) => {
              const url = getEntityUrl(log.entityType, log.entityId);
              const text = `${log.admin.name} ${formatActivityLog(log)}`;
              return (
                <li key={log.id}>
                  {url ? <Link href={url}>{text}</Link> : <span>{text}</span>}
                  {" · "}
                  {log.createdAt.toLocaleString("id-ID", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/admin/activity">Lihat semua →</Link>
      </div>
      <div>
        <h2>Peminjaman Aktif</h2>
        {activeRoster.length === 0 ? (
          <p>No active loans right now.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Peminjam</th>
                <th>Angkatan</th>
                <th>Instrumen</th>
                <th>No. Seri</th>
                <th>LINE ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeRoster.map((req) => (
                <tr key={req.id}>
                  <td>
                    <Link href={`/admin/requests/${req.id}`}>
                      {req.borrowerName}
                    </Link>
                  </td>
                  <td>{req.borrowerYear}</td>
                  <td>{req.instrument?.type}</td>
                  <td>{req.instrument?.serialNumber}</td>
                  <td>{req.borrowerLineId}</td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background:
                          req.status === "overdue" ? "#fee2e2" : "#dbeafe",
                        color: req.status === "overdue" ? "#991b1b" : "#1e40af",
                      }}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Link href="/admin/requests?status=active">
          Lihat semua peminjaman aktif →
        </Link>
      </div>
    </div>
  );
}
