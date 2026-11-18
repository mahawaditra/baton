"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { EmptyCell } from "@/components/DataTable";
import { formatRupiah } from "@/lib/format";
import { formatNameWithNickname } from "@/lib/loan/loan-rules";
import type { ArchivedRequest } from "./archive-row";

export const columns: ColumnDef<ArchivedRequest>[] = [
  {
    id: "borrowerName",
    header: "Borrower",
    accessorFn: (row) =>
      formatNameWithNickname(row.borrowerName, row.borrowerNickname),
  },
  { accessorKey: "borrowerYear", header: "Year" },
  {
    id: "instrument",
    header: "Instrument",
    accessorFn: (row) => row.instrument?.type ?? row.instrumentTypeRequested,
    cell: ({ row }) => (
      <span>
        {row.original.instrument?.type ?? row.original.instrumentTypeRequested}
        {row.original.instrument?.serialNumber && (
          <span className="tabular text-muted-foreground">
            {" "}
            ({row.original.instrument.serialNumber})
          </span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <RequestStatusBadge status={row.original.status} />,
  },
  {
    id: "periode",
    header: "Period",
    accessorFn: (row) => row.loanPeriods.length,
    cell: ({ row }) =>
      row.original.loanPeriods.length === 0 ? (
        <EmptyCell />
      ) : (
        `${row.original.loanPeriods.length} period${row.original.loanPeriods.length !== 1 ? "s" : ""}`
      ),
  },
  {
    accessorKey: "depositRefundAmount",
    header: "Deposit refund",
    cell: ({ row }) =>
      row.original.depositRefundAmount != null ? (
        <span className="tabular">
          {formatRupiah(row.original.depositRefundAmount)}
        </span>
      ) : (
        <EmptyCell />
      ),
  },
];
