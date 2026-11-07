import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { RequestsExplorer } from "./RequestsExplorer";
import { hideContactUnlessHandover, requestRowSelect } from "./request-row";
import { REQUESTS_VIEW_COOKIE, resolveRequestsView } from "./request-view";
import { countTransferableLoans } from "@/lib/admin/queries";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getRequestStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { MusicGlyph } from "@/components/MusicGlyph";

const REQUEST_STATUSES = [
  "submitted",
  "reviewing",
  "contract_generated",
  "documents_uploaded",
  "ready_to_pickup",
  "active",
  "rejected",
  "overdue",
  "cancelled",
] as const;

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cohort?: string; view?: string }>;
}) {
  const { status, cohort, view } = await searchParams;
  const ongoing = cohort === "ongoing";

  const selectedStatuses = ongoing
    ? []
    : (status ?? "")
        .split(",")
        .filter((s): s is (typeof REQUEST_STATUSES)[number] =>
          (REQUEST_STATUSES as readonly string[]).includes(s),
        );

  const savedView = (await cookies()).get(REQUESTS_VIEW_COOKIE)?.value;
  const board =
    resolveRequestsView({
      view,
      hasFilter: ongoing || selectedStatuses.length > 0,
      savedView,
    }) === "board";

  const [rows, transferableCount] = await Promise.all([
    prisma.borrowingRequest.findMany({
      where: board
        ? { status: { not: "returned" } }
        : ongoing
          ? {
              status: { in: ["active", "overdue"] },
              carriedOverAt: { not: null },
            }
          : selectedStatuses.length > 0
            ? { status: { in: selectedStatuses } }
            : {},
      select: requestRowSelect,
      orderBy: { createdAt: "desc" },
    }),
    countTransferableLoans(),
  ]);
  const requests = rows.map(hideContactUnlessHandover);

  const filterQuery = ongoing
    ? "cohort=ongoing"
    : selectedStatuses.length > 0
      ? `status=${selectedStatuses.join(",")}`
      : "";
  const tableRootHref = "/requests?view=table";
  const tableHref = filterQuery ? `/requests?${filterQuery}` : tableRootHref;
  const boardHref = filterQuery
    ? `/requests?${filterQuery}&view=board`
    : "/requests?view=board";

  const filters = (
    <div className="flex gap-2 max-md:-mx-6 max-md:overflow-x-auto max-md:px-6 max-md:[scrollbar-width:none] max-md:mask-r-from-[calc(100%-1.5rem)] md:flex-wrap">
      <Link
        href={tableRootHref}
        className={cn(
          buttonVariants({
            variant:
              !ongoing && selectedStatuses.length === 0 ? "default" : "outline",
            size: "sm",
          }),
          "shrink-0",
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
                ? `/requests?status=${nextStatuses.join(",")}`
                : tableRootHref
            }
            className={cn(
              buttonVariants({
                variant: isSelected ? "default" : "outline",
                size: "sm",
              }),
              "shrink-0",
              isSelected && "max-md:-order-1",
            )}
          >
            {getRequestStatusLabel(s)}
          </Link>
        );
      })}
      <Link
        href="/requests?cohort=ongoing"
        className={cn(
          buttonVariants({
            variant: ongoing ? "default" : "outline",
            size: "sm",
          }),
          "shrink-0",
          ongoing && "max-md:-order-1",
        )}
      >
        <MusicGlyph glyph="fermata" className="text-[1.125rem]" />
        Ongoing
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Requests</h1>

      <RequestsExplorer
        requests={requests}
        view={board ? "board" : "table"}
        tableHref={tableHref}
        boardHref={boardHref}
        filters={filters}
        transferableCount={transferableCount}
      />
    </div>
  );
}
