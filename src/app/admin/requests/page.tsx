import { prisma } from "@/lib/prisma";
import { RequestsTable } from "./RequestsTable";
import Link from "next/link";

const STATUS_FILTERS = [
  "all",
  "submitted",
  "reviewing",
  "ready_to_pickup",
  "active",
  "rejected",
  "overdue",
];

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;

  const requests = await prisma.borrowingRequest.findMany({
    where: status === "all" ? {} : { status: status as any },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>Requests</h1>

      <nav>
        {STATUS_FILTERS.map((s) => (
          <Link key={s} href={`/admin/requests?status=${s}`}>
            {s}
          </Link>
        ))}
      </nav>

      <RequestsTable data={requests} />
    </div>
  );
}
