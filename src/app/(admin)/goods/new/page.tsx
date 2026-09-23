import { prisma } from "@/lib/prisma";
import { CreateGoodForm } from "./CreateGoodForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewGoodPage() {
  const goods = await prisma.good.findMany({
    select: { location: true },
  });
  const locations = [...new Set(goods.map((g) => g.location))].sort();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">New Good</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateGoodForm locations={locations} />
        </CardContent>
      </Card>
    </div>
  );
}
