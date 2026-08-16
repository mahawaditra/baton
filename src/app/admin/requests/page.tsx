import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getRequestStatusLabel } from "@/components/RequestStatusBadge";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Requests</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/requests"
          className={cn(
            buttonVariants({
              variant: selectedStatuses.length === 0 ? "default" : "outline",
              size: "sm",
            }),
          )}
        >
          All
        </Link>
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
              className={cn(
                buttonVariants({
                  variant: isSelected ? "default" : "outline",
                  size: "sm",
                }),
              )}
            >
              {getRequestStatusLabel(s)}
            </Link>
          );
        })}
      </div>

      <DataTable data={requests} columns={columns} />
    </div>
  );
}
