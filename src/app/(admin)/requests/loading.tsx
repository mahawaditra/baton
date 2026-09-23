import { LoadingMarquee } from "@/components/LoadingMarquee";
import { TableRowsSkeleton } from "@/components/TableRowsSkeleton";

export default function RequestsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="hidden text-h1 lg:block">Requests</h1>
      <LoadingMarquee />
      <TableRowsSkeleton columns={7} rows={7} />
    </div>
  );
}
