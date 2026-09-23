import { prisma } from "@/lib/prisma";
import { CreateInstrumentForm } from "./CreateInstrumentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewInstrumentPage() {
  const instruments = await prisma.instrument.findMany({
    select: { section: true, type: true },
  });
  const sections = [...new Set(instruments.map((i) => i.section))].sort();
  const types = [...new Set(instruments.map((i) => i.type))].sort();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">New Instrument</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateInstrumentForm sections={sections} types={types} />
        </CardContent>
      </Card>
    </div>
  );
}
