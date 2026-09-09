"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { ExtensionBadge } from "@/components/ExtensionBadge";
import { confirmedExtensionCount } from "@/lib/loan-rules";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RequestRow = Prisma.BorrowingRequestGetPayload<{
  include: { loanPeriods: { select: { sequence: true; startDate: true } } };
}>;

export const columns: ColumnDef<RequestRow>[] = [
  {
    accessorKey: "ticketId",
    header: "Ticket ID",
    cell: ({ row }) => (
      <span className="tabular font-medium">{row.original.ticketId}</span>
    ),
  },
  { accessorKey: "borrowerName", header: "Name" },
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
        {row.original.createdAt.toLocaleDateString("en-GB")}
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
