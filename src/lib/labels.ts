import type {
  AddendumTiming,
  AdminRole,
  BorrowingRequestStatus,
  DocumentReviewStatus,
  InstrumentStatus,
  ItemCondition,
} from "@/generated/prisma/client";

export const REQUEST_STATUS_LABELS: Record<BorrowingRequestStatus, string> = {
  submitted: "Diajukan",
  reviewing: "Ditinjau",
  contract_generated: "Kontrak Terbit",
  documents_uploaded: "Dokumen Masuk",
  ready_to_pickup: "Siap Diambil",
  active: "Sedang Dipinjam",
  returned: "Selesai",
  rejected: "Ditolak",
  overdue: "Terlambat",
  cancelled: "Dibatalkan",
};

export const DOCUMENT_REVIEW_STATUS_LABELS: Record<
  DocumentReviewStatus,
  string
> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export const ADDENDUM_TIMING_LABELS: Record<AddendumTiming, string> = {
  initial: "Kondisi Awal",
  final: "Kondisi Akhir",
};

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  ok: "Baik",
  need_repair: "Perlu revitalisasi",
  retired: "Pensiun",
  lost: "Hilang",
};

export const STATUS_LABELS: Record<InstrumentStatus, string> = {
  available: "Tersedia",
  reserved: "Dibooking",
  borrowed: "Dipinjam",
  placed: "Ditempatkan",
  unavailable: "Nonaktif",
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  staff: "Staff",
  pengurus_inti: "Pengurus Inti",
  ketua: "Ketua",
  overlord: "Overlord",
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  signed_contract: "Kontrak yang Ditandatangani",
  deposit_proof: "Bukti Transfer Deposit",
  ktp_scan: "Scan KTP",
};

export function getConditionLabel(condition: string): string {
  return CONDITION_LABELS[condition as ItemCondition] ?? condition;
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as InstrumentStatus] ?? status;
}

export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}

export function getRequestStatusLabel(status: string): string {
  return REQUEST_STATUS_LABELS[status as BorrowingRequestStatus] ?? status;
}

export function getDocumentReviewStatusLabel(status: string): string {
  return (
    DOCUMENT_REVIEW_STATUS_LABELS[status as DocumentReviewStatus] ?? status
  );
}

export function getAddendumTimingLabel(timing: string): string {
  return ADDENDUM_TIMING_LABELS[timing as AddendumTiming] ?? timing;
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as AdminRole] ?? role;
}
