import { prisma } from "@/lib/prisma";
import { InstrumentsExplorer } from "./InstrumentsExplorer";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function InstrumentsPage() {
  const instruments = await prisma.instrument.findMany({
    orderBy: { section: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Instruments</h1>
      <InstrumentsExplorer
        instruments={instruments}
        action={
          <Link href="/admin/instruments/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New Instrument
          </Link>
        }
      />
    </div>
  );
}
