"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  BorrowingRequest,
  Instrument,
  LoanPeriod,
} from "@/generated/prisma/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ArchivedRequest = BorrowingRequest & {
  instrument: Instrument | null;
  loanPeriods: LoanPeriod[];
};

export const columns: ColumnDef<ArchivedRequest>[] = [
  { accessorKey: "borrowerName", header: "Borrower" },
  { accessorKey: "borrowerYear", header: "Year" },
  {
    id: "instrument",
    header: "Instrument",
    accessorFn: (row) => row.instrument?.type ?? "",
    cell: ({ row }) => (
      <span>
        {row.original.instrument?.type}{" "}
        <span className="tabular text-muted-foreground">
          ({row.original.instrument?.serialNumber})
        </span>
      </span>
    ),
  },
  {
    id: "periode",
    header: "Period",
    accessorFn: (row) => row.loanPeriods.length,
    cell: ({ row }) =>
      `${row.original.loanPeriods.length} period${row.original.loanPeriods.length !== 1 ? "s" : ""}`,
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
        href={`/admin/requests/${row.original.id}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        View
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Link>
    ),
  },
];
