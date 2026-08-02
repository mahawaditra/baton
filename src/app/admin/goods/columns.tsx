"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { Good } from "@/generated/prisma/client";

const conditionColor: Record<string, string> = {
  ok: "bg-green-100 text-green-800",
  need_repair: "bg-yellow-100 text-yellow-800",
  retired: "bg-gray-100 text-gray-800",
  lost: "bg-red-100 text-red-800",
};

export const columns: ColumnDef<Good>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "quantity", header: "Qty" },
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
  { accessorKey: "location", header: "Location" },
  { accessorKey: "registrationNo", header: "Reg. No." },
  {
    id: "view",
    header: "",
    cell: ({ row }) => (
      <Link href={`/admin/goods/${row.original.id}`}>View →</Link>
    ),
  },
];
