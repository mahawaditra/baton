import { StatusPill, type StatusPillTone } from "@/components/StatusPill";
import { REQUEST_STATUS_LABELS } from "@/lib/labels";
import type { BorrowingRequestStatus } from "@/generated/prisma/client";

const REQUEST_STATUS_CONFIG: Record<BorrowingRequestStatus, StatusPillTone> = {
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
  return (
    <StatusPill tone={REQUEST_STATUS_CONFIG[status]} variant={variant}>
      {REQUEST_STATUS_LABELS[status]}
    </StatusPill>
  );
}
