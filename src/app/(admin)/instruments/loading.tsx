import { LoadingMarquee } from "@/components/LoadingMarquee";
import { TableRowsSkeleton } from "@/components/TableRowsSkeleton";

export default function InstrumentsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Instruments</h1>
      <LoadingMarquee />
      <TableRowsSkeleton columns={8} rows={7} />
    </div>
  );
}
