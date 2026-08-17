import { Wrench, Archive, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  InstrumentStatus,
  ItemCondition,
} from "@/generated/prisma/client";

const STATUS_CONFIG: Record<
  InstrumentStatus,
  { label: string; bg: string; fg: string; dot: string }
> = {
  available: {
    label: "Tersedia",
    bg: "bg-success-soft",
    fg: "text-success-soft-foreground",
    dot: "bg-success",
  },
  reserved: {
    label: "Dibooking",
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  borrowed: {
    label: "Dipinjam",
    bg: "bg-plum-soft",
    fg: "text-plum",
    dot: "bg-plum",
  },
  placed: {
    label: "Ditempatkan",
    bg: "bg-info-soft",
    fg: "text-info-soft-foreground",
    dot: "bg-info",
  },
  unavailable: {
    label: "Nonaktif",
    bg: "bg-muted",
    fg: "text-foreground-2",
    dot: "bg-foreground-2",
  },
};

const CONDITION_CONFIG: Partial<
  Record<
    ItemCondition,
    { label: string; icon: typeof Wrench; className: string }
  >
> = {
  need_repair: {
    label: "Perlu servis",
    icon: Wrench,
    className: "bg-warning-soft text-warning-soft-foreground",
  },
  retired: {
    label: "Pensiun",
    icon: Archive,
    className:
      "border border-dashed border-border-strong text-muted-foreground",
  },
  lost: {
    label: "Hilang",
    icon: SearchX,
    className: "bg-destructive-soft text-destructive",
  },
};

export function ConditionIndicator({
  condition,
}: {
  condition: ItemCondition;
}) {
  const conditionConfig = CONDITION_CONFIG[condition];
  if (!conditionConfig) return null;

  return (
    <span
      aria-label={conditionConfig.label}
      title={conditionConfig.label}
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
          "inline-flex h-[22px] items-center gap-1.5 px-2 text-micro uppercase",
          variant === "pill" ? "rounded-full" : "rounded-sm",
          statusConfig.bg,
          statusConfig.fg,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dot)} />
        {statusConfig.label}
      </span>
      <ConditionIndicator condition={condition} />
    </span>
  );
}

export function getStatusLabel(status: InstrumentStatus) {
  return STATUS_CONFIG[status].label;
}

export function getConditionLabel(condition: ItemCondition) {
  return CONDITION_CONFIG[condition]?.label ?? "Baik";
}
