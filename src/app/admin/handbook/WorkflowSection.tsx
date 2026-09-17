import { LoanFlowDiagram } from "./LoanFlowDiagram";

export function WorkflowSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="hidden text-h1 lg:block">Workflow</h1>
        <p className="mt-1 text-sm text-foreground-2">
          Siapa gerak di tiap tahap, dan apa yang beneran kejadian di
          baliknya. Hover atau fokus (tab) ke tiap kotak buat lihat
          detailnya.
        </p>
      </div>
      <LoanFlowDiagram />
    </div>
  );
}
