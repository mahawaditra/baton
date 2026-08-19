import { prisma } from "@/lib/prisma";
import { InstrumentsExplorer } from "./InstrumentsExplorer";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AdminHeaderAction } from "@/components/AdminHeaderAction";

export default async function InstrumentsPage() {
  const instruments = await prisma.instrument.findMany({
    orderBy: { section: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Instruments</h1>
      <AdminHeaderAction>
        <Link
          href="/admin/instruments/new"
          aria-label="New Instrument"
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </AdminHeaderAction>
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
