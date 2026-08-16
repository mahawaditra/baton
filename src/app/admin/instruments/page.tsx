import { prisma } from "@/lib/prisma";
import { InstrumentsExplorer } from "./InstrumentsExplorer";

export default async function InstrumentsPage() {
  const instruments = await prisma.instrument.findMany({
    orderBy: { section: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Instruments</h1>
      <InstrumentsExplorer instruments={instruments} />
    </div>
  );
}
