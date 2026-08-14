import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import Link from "next/link";

const REQUEST_STATUSES = [
  "submitted",
  "reviewing",
  "ready_to_pickup",
  "active",
  "rejected",
  "overdue",
] as const;

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const selectedStatuses = (status ?? "")
    .split(",")
    .filter((s): s is (typeof REQUEST_STATUSES)[number] =>
      (REQUEST_STATUSES as readonly string[]).includes(s),
    );

  const requests = await prisma.borrowingRequest.findMany({
    where:
      selectedStatuses.length > 0 ? { status: { in: selectedStatuses } } : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>Requests</h1>

      <nav>
        <Link href="/admin/requests">all</Link>
        {REQUEST_STATUSES.map((s) => {
          const isSelected = selectedStatuses.includes(s);
          const nextStatuses = isSelected
            ? selectedStatuses.filter((x) => x !== s)
            : [...selectedStatuses, s];

          return (
            <Link
              key={s}
              href={
                nextStatuses.length > 0
                  ? `/admin/requests?status=${nextStatuses.join(",")}`
                  : "/admin/requests"
              }
            >
              {isSelected ? `[x] ${s}` : s}
            </Link>
          );
        })}
      </nav>

      <DataTable data={requests} columns={columns} />
    </div>
  );
}
