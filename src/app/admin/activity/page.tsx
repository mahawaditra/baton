import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatActivityLog, getEntityUrl } from "@/lib/format";

const PAGE_SIZE = 30;

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

  return (
    <div>
      <h1>Activity Log</h1>

      {logs.length === 0 ? (
        <p>No activity recorded yet.</p>
      ) : (
        <ul>
          {logs.map((log) => {
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

      <nav>
        {page > 1 && (
          <Link href={`/admin/activity?page=${page - 1}`}>← Prev</Link>
        )}
        <span>
          {" "}
          Page {page} of {totalPages}{" "}
        </span>
        {page < totalPages && (
          <Link href={`/admin/activity?page=${page + 1}`}>Next →</Link>
        )}
      </nav>
    </div>
  );
}
