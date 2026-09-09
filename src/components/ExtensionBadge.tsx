import { RotateCw } from "lucide-react";

export function ExtensionBadge({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <span
      title={`Extension ${count}`}
      className="inline-flex h-[22px] items-center gap-0.5 rounded-sm bg-plum-soft px-1.5 text-micro font-semibold text-plum"
    >
      <RotateCw className="h-3 w-3" strokeWidth={2.25} />
      {count}
    </span>
  );
}
