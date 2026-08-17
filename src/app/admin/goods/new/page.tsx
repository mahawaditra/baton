import { CreateGoodForm } from "./CreateGoodForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewGoodPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">New Good</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateGoodForm />
        </CardContent>
      </Card>
    </div>
  );
}
