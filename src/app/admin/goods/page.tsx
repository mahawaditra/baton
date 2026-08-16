import { prisma } from "@/lib/prisma";
import { GoodsExplorer } from "./GoodsExplorer";

export default async function GoodsPage() {
  const goods = await prisma.good.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Goods</h1>
      <GoodsExplorer goods={goods} />
    </div>
  );
}
