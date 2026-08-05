"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { Instrument } from "@/generated/prisma/client";
import { conditionColor } from "@/lib/constants";

const statusColor: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-yellow-100 text-yellow-800",
  borrowed: "bg-blue-100 text-blue-800",
  placed: "bg-purple-100 text-purple-800",
  unavailable: "bg-red-100 text-red-800",
};

export const columns: ColumnDef<Instrument>[] = [
  { accessorKey: "section", header: "Section" },
  { accessorKey: "type", header: "Instrument" },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "serialNumber", header: "Serial No." },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ row }) => (
      <span
        className={`rounded px-2 py-1 text-xs ${conditionColor[row.original.condition]}`}
      >
        {row.original.condition}
      </span>
    ),
  },
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
  { accessorKey: "location", header: "Location" },
  {
    id: "view",
    header: "",
    cell: ({ row }) => (
      <Link href={`/admin/instruments/${row.original.id}`}>View →</Link>
    ),
  },
];
