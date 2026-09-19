import { Wrench, Archive, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONDITION_LABELS, STATUS_LABELS } from "@/lib/labels";
import type {
  InstrumentStatus,
  ItemCondition,
} from "@/generated/prisma/client";

export { getConditionLabel, getStatusLabel } from "@/lib/labels";

const STATUS_CONFIG: Record<
  InstrumentStatus,
  { bg: string; fg: string; dot: string }
> = {
  available: {
    bg: "bg-success-soft",
    fg: "text-success-soft-foreground",
    dot: "bg-success",
  },
  reserved: {
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  borrowed: {
    bg: "bg-plum-soft",
    fg: "text-plum",
    dot: "bg-plum",
  },
  placed: {
    bg: "bg-info-soft",
    fg: "text-info-soft-foreground",
    dot: "bg-info",
  },
  unavailable: {
    bg: "bg-muted",
    fg: "text-foreground-2",
    dot: "bg-foreground-2",
  },
};

const CONDITION_CONFIG: Partial<
  Record<ItemCondition, { icon: typeof Wrench; className: string }>
> = {
  need_repair: {
    icon: Wrench,
    className: "bg-warning-soft text-warning-soft-foreground",
  },
  retired: {
    icon: Archive,
    className:
      "border border-dashed border-border-strong text-muted-foreground",
  },
  lost: {
    icon: SearchX,
    className: "bg-destructive-soft text-destructive",
  },
};

export const CONDITION_OPTIONS = (
  Object.keys(CONDITION_LABELS) as ItemCondition[]
).map((value) => ({ value, label: CONDITION_LABELS[value] }));

export const STATUS_OPTIONS = (
  Object.keys(STATUS_LABELS) as InstrumentStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export function ConditionIndicator({
  condition,
}: {
  condition: ItemCondition;
}) {
  const conditionConfig = CONDITION_CONFIG[condition];
  if (!conditionConfig) return null;

  return (
    <span
      aria-label={CONDITION_LABELS[condition]}
      title={CONDITION_LABELS[condition]}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-sm",
        conditionConfig.className,
      )}
    >
      <conditionConfig.icon className="h-3 w-3" strokeWidth={2} />
    </span>
  );
}

export function StatusBadge({
  status,
  condition,
  variant = "chip",
}: {
  status: InstrumentStatus;
  condition: ItemCondition;
  variant?: "chip" | "pill";
}) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap px-2 text-micro uppercase",
          variant === "pill" ? "rounded-full" : "rounded-sm",
          statusConfig.bg,
          statusConfig.fg,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dot)} />
        {STATUS_LABELS[status]}
      </span>
      <ConditionIndicator condition={condition} />
    </span>
  );
}
