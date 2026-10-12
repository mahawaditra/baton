import { Calendar, RotateCcw } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { EntityCard } from "@/components/EntityCard";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { formatNameWithNickname } from "@/lib/loan/loan-rules";
import { formatJakartaDate } from "@/lib/format";
import type { ArchivedRequest } from "./archive-row";
import { columns } from "./columns";

function ArchiveCard({ request }: { request: ArchivedRequest }) {
  const periodCount = request.loanPeriods.length;

  return (
    <EntityCard
      href={`/requests/${request.id}`}
      title={formatNameWithNickname(request.borrowerName, request.borrowerNickname)}
      titleSuffix={
        <span className="tabular shrink-0 text-caption text-muted-foreground">
          {request.borrowerYear}
        </span>
      }
      subtitle={
        <>
          {request.instrument?.type ?? request.instrumentTypeRequested}{" "}
          {request.instrument?.serialNumber && (
            <span className="tabular">
              ({request.instrument.serialNumber})
            </span>
          )}
        </>
      }
      topRight={
        <div className="flex shrink-0 flex-col items-end gap-1">
          <RequestStatusBadge status={request.status} />
          {request.depositRefundAmount != null && (
            <span className="tabular text-caption font-medium text-foreground">
              {`Rp${request.depositRefundAmount.toLocaleString("id-ID")}`}
            </span>
          )}
        </div>
      }
      metaLeft={
        periodCount > 0
          ? [
              {
                icon: RotateCcw,
                text: `${periodCount} period${periodCount !== 1 ? "s" : ""}`,
              },
            ]
          : []
      }
      metaGrow={{
        icon: Calendar,
        text: formatJakartaDate(request.createdAt),
      }}
    />
  );
}

export function ArchiveExplorer({ requests }: { requests: ArchivedRequest[] }) {
  return (
    <>
      <div className="hidden lg:block">
        <DataTable data={requests} columns={columns} />
      </div>
      <div className="flex flex-col gap-2.5 lg:hidden">
        {requests.map((request) => (
          <ArchiveCard key={request.id} request={request} />
        ))}
      </div>
    </>
  );
}
