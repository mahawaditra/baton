import { prisma } from "@/lib/prisma";
import { InstrumentsTable } from "./InstrumentsTable";

export default async function InstrumentsPage() {
  const instruments = await prisma.instrument.findMany({
    orderBy: {
      section: "asc",
    },
  });

  return (
    <div>
      <h1>Instruments</h1>
      <InstrumentsTable data={instruments} />
    </div>
  );
}
