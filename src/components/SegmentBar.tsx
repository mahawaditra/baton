import { staggerStyle } from "@/lib/utils";

export function SegmentBar({
  filled,
  total,
}: {
  filled: number;
  total: number;
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
              className="slot-fill block h-full rounded-full bg-plum"
              style={staggerStyle(index)}
            />
          )}
        </span>
      ))}
    </div>
  );
}
