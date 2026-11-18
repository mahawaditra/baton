import { cn, staggerStyle } from "@/lib/utils";

const FILL_TONE = {
  primary: "bg-primary",
  plum: "bg-plum",
} as const;

export function SegmentBar({
  filled,
  total,
  tone = "primary",
}: {
  filled: number;
  total: number;
  tone?: keyof typeof FILL_TONE;
}) {
  return (
    <div aria-hidden className="flex gap-0.5">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className="h-1 flex-1 overflow-hidden rounded-full bg-border"
        >
          {index < filled && (
            <span
              className={cn(
                "slot-fill block h-full rounded-full",
                FILL_TONE[tone],
              )}
              style={staggerStyle(index)}
            />
          )}
        </span>
      ))}
    </div>
  );
}
