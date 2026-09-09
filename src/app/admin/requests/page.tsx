import { prisma } from "@/lib/prisma";
import { RequestsExplorer } from "./RequestsExplorer";
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
  "cancelled",
] as const;

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cohort?: string }>;
}) {
  const { status, cohort } = await searchParams;
  const ongoing = cohort === "ongoing";

  const selectedStatuses = ongoing
    ? []
    : (status ?? "")
        .split(",")
        .filter((s): s is (typeof REQUEST_STATUSES)[number] =>
          (REQUEST_STATUSES as readonly string[]).includes(s),
        );

  const requests = await prisma.borrowingRequest.findMany({
    where: ongoing
      ? { status: { in: ["active", "overdue"] }, carriedOverAt: { not: null } }
      : selectedStatuses.length > 0
        ? { status: { in: selectedStatuses } }
        : {},
    include: {
      loanPeriods: {
        select: { sequence: true, startDate: true },
        orderBy: { sequence: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Requests</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/requests"
          className={cn(
            buttonVariants({
              variant:
                !ongoing && selectedStatuses.length === 0
                  ? "default"
                  : "outline",
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
        <Link
          href="/admin/requests?cohort=ongoing"
          className={cn(
            buttonVariants({
              variant: ongoing ? "default" : "outline",
              size: "sm",
            }),
          )}
        >
          Ongoing
        </Link>
      </div>

      <RequestsExplorer requests={requests} />
    </div>
  );
}
