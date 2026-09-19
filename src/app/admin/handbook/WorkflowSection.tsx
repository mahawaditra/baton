import { Card, CardContent } from "@/components/ui/card";
import { LoanFlowStepper } from "./LoanFlowStepper";

export function WorkflowSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="hidden text-h1 lg:block">Workflow</h1>
        <p className="mt-1 text-sm text-foreground-2">
          Siapa gerak di tiap tahap, dan apa yang beneran kejadian di
          baliknya. Klik tiap langkah buat lihat detailnya.
        </p>
      </div>
      <Card>
        <CardContent>
          <LoanFlowStepper />
        </CardContent>
      </Card>
    </div>
  );
}
