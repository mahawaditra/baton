"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { ExtensionBadge } from "@/components/ExtensionBadge";
import { confirmedExtensionCount, formatNameWithNickname } from "@/lib/loan/loan-rules";
import { formatJakartaDate } from "@/lib/format";
import type { RequestRow } from "./request-row";

export const columns: ColumnDef<RequestRow>[] = [
  {
    accessorKey: "ticketId",
    header: "Ticket ID",
    cell: ({ row }) => (
      <span className="tabular font-medium">{row.original.ticketId}</span>
    ),
  },
  {
    id: "borrowerName",
    header: "Name",
    accessorFn: (row) =>
      formatNameWithNickname(row.borrowerName, row.borrowerNickname),
  },
  { accessorKey: "borrowerYear", header: "Year" },
  { accessorKey: "instrumentTypeRequested", header: "Instrument" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <RequestStatusBadge status={row.original.status} />
        <ExtensionBadge
          count={confirmedExtensionCount(row.original.loanPeriods[0])}
        />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="tabular">
        {formatJakartaDate(row.original.createdAt)}
      </span>
    ),
  },
];
