"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { BorrowingRequest } from "@/generated/prisma/client";

const statusColor: Record<string, string> = {
  submitted: "bg-gray-100 text-gray-800",
  reviewing: "bg-yellow-100 text-yellow-800",
  contract_generated: "bg-yellow-100 text-yellow-800",
  documents_uploaded: "bg-yellow-100 text-yellow-800",
  ready_to_pickup: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  returned: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
  overdue: "bg-orange-100 text-orange-800",
};

export const columns: ColumnDef<BorrowingRequest>[] = [
  { accessorKey: "ticketId", header: "Ticket ID" },
  { accessorKey: "borrowerName", header: "Name" },
  { accessorKey: "borrowerYear", header: "Year" },
  { accessorKey: "instrumentTypeRequested", header: "Instrument" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`rounded px-2 py-1 text-xs ${statusColor[row.original.status]}`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => row.original.createdAt.toLocaleDateString("en-GB"),
  },
  {
    id: "view",
    header: "",
    cell: ({ row }) => (
      <Link href={`/admin/requests/${row.original.id}`}>View →</Link>
    ),
  },
];
