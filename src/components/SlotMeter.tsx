import { cn, staggerStyle } from "@/lib/utils";

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
      <div aria-hidden className="flex gap-0.5">
        {Array.from({ length: max }).map((_, index) => (
          <span
            key={index}
            className="h-1 flex-1 overflow-hidden rounded-full bg-border"
          >
            {index < used && (
              <span
                className="slot-fill block h-full rounded-full bg-plum"
                style={staggerStyle(index)}
              />
            )}
          </span>
        ))}
      </div>
      <div className="tabular mt-1 text-xs text-muted-foreground">
        Slot {used}/{max}
        {shared && " · shared"}
      </div>
    </div>
  );
}
