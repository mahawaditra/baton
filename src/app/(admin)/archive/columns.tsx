"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { formatNameWithNickname } from "@/lib/loan/loan-rules";
import { cn } from "@/lib/utils";
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
      row.original.loanPeriods.length === 0
        ? "—"
        : `${row.original.loanPeriods.length} period${row.original.loanPeriods.length !== 1 ? "s" : ""}`,
  },
  {
    accessorKey: "depositRefundAmount",
    header: "Deposit Refund",
    cell: ({ row }) => (
      <span className="tabular">
        {row.original.depositRefundAmount != null
          ? `Rp${row.original.depositRefundAmount.toLocaleString("id-ID")}`
          : "—"}
      </span>
    ),
  },
  {
    id: "view",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/requests/${row.original.id}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        View
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>
    ),
  },
];
