import { prisma } from "@/lib/prisma";
import { GoodsExplorer } from "./GoodsExplorer";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AdminHeaderAction } from "@/components/AdminHeaderAction";

export default async function GoodsPage() {
  const goods = await prisma.good.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Goods</h1>
      <AdminHeaderAction>
        <Link
          href="/admin/goods/new"
          aria-label="New Good"
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </AdminHeaderAction>
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
