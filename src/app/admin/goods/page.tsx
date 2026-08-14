import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";

export default async function GoodsPage() {
  const goods = await prisma.good.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1>Goods</h1>
      <DataTable data={goods} columns={columns} />
    </div>
  );
}
