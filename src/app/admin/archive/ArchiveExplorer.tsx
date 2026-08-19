import { RotateCcw } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { EntityCard } from "@/components/EntityCard";
import { columns, type ArchivedRequest } from "./columns";

function ArchiveCard({ request }: { request: ArchivedRequest }) {
  return (
    <EntityCard
      href={`/admin/requests/${request.id}`}
      title={request.borrowerName}
      titleSuffix={
        <span className="tabular shrink-0 text-caption text-muted-foreground">
          {request.borrowerYear}
        </span>
      }
      subtitle={
        <>
          {request.instrument?.type}{" "}
          {request.instrument?.serialNumber && (
            <span className="tabular">
              ({request.instrument.serialNumber})
            </span>
          )}
        </>
      }
      topRight={
        <span className="tabular shrink-0 text-caption font-medium text-foreground">
          {request.depositRefundAmount != null
            ? `Rp${request.depositRefundAmount.toLocaleString("id-ID")}`
            : "—"}
        </span>
      }
      metaLeft={[
        {
          icon: RotateCcw,
          text: `${request.loanPeriods.length} period${request.loanPeriods.length !== 1 ? "s" : ""}`,
        },
      ]}
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
