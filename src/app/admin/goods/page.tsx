import { prisma } from "@/lib/prisma";
import { GoodsExplorer } from "./GoodsExplorer";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function GoodsPage() {
  const goods = await prisma.good.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Goods</h1>
      <GoodsExplorer
        goods={goods}
        action={
          <Link href="/admin/goods/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New Good
          </Link>
        }
      />
    </div>
  );
}
