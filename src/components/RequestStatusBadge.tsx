import { cn } from "@/lib/utils";
import type { BorrowingRequestStatus } from "@/generated/prisma/client";

const REQUEST_STATUS_CONFIG: Record<
  BorrowingRequestStatus,
  { label: string; bg: string; fg: string; dot: string }
> = {
  submitted: {
    label: "Diajukan",
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  reviewing: {
    label: "Ditinjau",
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  contract_generated: {
    label: "Kontrak Terbit",
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  documents_uploaded: {
    label: "Dokumen Masuk",
    bg: "bg-gold-soft",
    fg: "text-gold-soft-foreground",
    dot: "bg-gold",
  },
  ready_to_pickup: {
    label: "Siap Diambil",
    bg: "bg-success-soft",
    fg: "text-success-soft-foreground",
    dot: "bg-success",
  },
  active: {
    label: "Sedang Dipinjam",
    bg: "bg-plum-soft",
    fg: "text-plum",
    dot: "bg-plum",
  },
  returned: {
    label: "Selesai",
    bg: "bg-muted",
    fg: "text-foreground-2",
    dot: "bg-foreground-2",
  },
  rejected: {
    label: "Ditolak",
    bg: "bg-destructive-soft",
    fg: "text-destructive",
    dot: "bg-destructive",
  },
  overdue: {
    label: "Terlambat",
    bg: "bg-destructive-soft",
    fg: "text-destructive",
    dot: "bg-destructive",
  },
  cancelled: {
    label: "Dibatalkan",
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
        "inline-flex h-[22px] items-center gap-1.5 px-2 text-micro uppercase",
        variant === "pill" ? "rounded-full" : "rounded-sm",
        config.bg,
        config.fg,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

export function getRequestStatusLabel(status: BorrowingRequestStatus) {
  return REQUEST_STATUS_CONFIG[status].label;
}
