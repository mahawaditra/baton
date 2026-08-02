import { prisma } from "@/lib/prisma";
import { GoodsTable } from "./GoodsTable";

export default async function GoodsPage() {
  const goods = await prisma.good.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1>Goods</h1>
      <GoodsTable data={goods} />
    </div>
  );
}
