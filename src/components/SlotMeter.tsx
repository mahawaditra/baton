import { SegmentBar } from "@/components/SegmentBar";
import { cn } from "@/lib/utils";

export function SlotMeter({
  used,
  max,
  className,
}: {
  used: number;
  max: number;
  className?: string;
}) {
  const shared = used > 0 && used < max;
  return (
    <div className={cn("w-24 shrink-0", className)}>
      <SegmentBar filled={used} total={max} />
      <div className="tabular mt-1 text-xs text-muted-foreground">
        Slot {used}/{max}
        {shared && " · shared"}
      </div>
    </div>
  );
}
