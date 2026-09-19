import { cn } from "@/lib/utils";
import { REQUEST_STATUS_LABELS } from "@/lib/labels";
import type { BorrowingRequestStatus } from "@/generated/prisma/client";

export { getRequestStatusLabel } from "@/lib/labels";

const REQUEST_STATUS_CONFIG: Record<
  BorrowingRequestStatus,
  { bg: string; fg: string; dot: string }
> = {
  submitted: {
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  reviewing: {
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  contract_generated: {
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  documents_uploaded: {
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  ready_to_pickup: {
    bg: "bg-success-soft",
    fg: "text-success-soft-foreground",
    dot: "bg-success",
  },
  active: {
    bg: "bg-plum-soft",
    fg: "text-plum",
    dot: "bg-plum",
  },
  returned: {
    bg: "bg-muted",
    fg: "text-foreground-2",
    dot: "bg-foreground-2",
  },
  rejected: {
    bg: "bg-destructive-soft",
    fg: "text-destructive",
    dot: "bg-destructive",
  },
  overdue: {
    bg: "bg-destructive-soft",
    fg: "text-destructive",
    dot: "bg-destructive",
  },
  cancelled: {
    bg: "bg-muted",
    fg: "text-foreground-2",
    dot: "bg-foreground-2",
  },
};

export function RequestStatusBadge({
  status,
  variant = "chip",
}: {
  status: BorrowingRequestStatus;
  variant?: "chip" | "pill";
}) {
  const config = REQUEST_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap px-2 text-micro uppercase",
        variant === "pill" ? "rounded-full" : "rounded-sm",
        config.bg,
        config.fg,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
