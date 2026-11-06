import { daysBetween, todayInJakarta } from "@/lib/format";
import type { BorrowingRequestStatus } from "@/generated/prisma/enums";

export function calculateDepositRefund(params: {
  daysLate: number;
  depositAmount: number;
  depositGraceDays: number;
  depositPartialAmount: number;
}): number {
  const { daysLate, depositAmount, depositGraceDays, depositPartialAmount } =
    params;
  if (daysLate <= 0) return depositAmount;
  if (daysLate <= depositGraceDays) return depositPartialAmount;
  return 0;
}

export function isOutOfServiceCondition(
  condition: "ok" | "need_repair" | "retired" | "lost",
): boolean {
  return condition === "retired" || condition === "lost";
}

export function determineInstrumentStatusOnReturn(
  condition: "ok" | "need_repair" | "retired" | "lost",
  requestedStatus: "available" | "unavailable",
): "available" | "unavailable" {
  return isOutOfServiceCondition(condition) ? "unavailable" : requestedStatus;
}

export function documentTypesNeedingUpload(
  requiredTypes: readonly string[],
  existingDocuments: { type: string; reviewStatus: string }[],
): string[] {
  const handledTypes = new Set(
    existingDocuments
      .filter((d) => d.reviewStatus !== "rejected")
      .map((d) => d.type),
  );
  return requiredTypes.filter((t) => !handledTypes.has(t));
}

export const LOAN_STEP_LABELS = [
  "Pengajuan Dikirim",
  "Lengkapi Data & Dokumen",
  "Ambil & Isi Addendum",
  "Sedang Dipinjam",
] as const;

export function getRequestStep(
  status: string,
  instrumentConfirmed: boolean,
): number | "exception" {
  if (status === "rejected" || status === "overdue" || status === "cancelled")
    return "exception";
  if (status === "submitted") return 1;
  if (status === "reviewing") return instrumentConfirmed ? 2 : 1;
  if (status === "contract_generated" || status === "documents_uploaded")
    return 2;
  if (status === "ready_to_pickup") return 3;
  if (status === "active" || status === "returned") return 4;
  return 1;
}

export function canAssignInstrument(
  status: string,
  instrumentConfirmed: boolean,
): boolean {
  return ["submitted", "reviewing"].includes(status) && !instrumentConfirmed;
}

export function canNotifyBorrower(
  status: string,
  instrumentConfirmed: boolean,
): boolean {
  return status === "reviewing" && !instrumentConfirmed;
}

const CANCELLABLE_STATUSES = [
  "submitted",
  "reviewing",
  "contract_generated",
  "documents_uploaded",
  "ready_to_pickup",
];

export function canCancelRequest(status: string): boolean {
  return CANCELLABLE_STATUSES.includes(status);
}

export const ACTIVE_INSTRUMENT_HOLD_STATUSES = [
  "reviewing",
  "contract_generated",
  "documents_uploaded",
  "ready_to_pickup",
  "active",
  "overdue",
] as const;

export function hasAvailableSlot(
  activeLoanCount: number,
  maxConcurrentLoans: number,
): boolean {
  return activeLoanCount < maxConcurrentLoans;
}

export function resolveMaxConcurrentLoans(
  instrumentType: string,
  slots: { instrumentType: string; maxConcurrentLoans: number }[],
): number {
  const match = slots.find((slot) =>
    instrumentType.toLowerCase().includes(slot.instrumentType.toLowerCase()),
  );
  return match?.maxConcurrentLoans ?? 1;
}

export function formatSharedLocation(
  holders: {
    borrowerName: string;
    borrowerNickname: string | null;
    borrowerYear: string;
  }[],
  fallback: string,
): string {
  if (holders.length === 0) return fallback;
  return holders
    .map(
      (h) =>
        `${resolveNickname(h.borrowerName, h.borrowerNickname)} (${h.borrowerYear})`,
    )
    .join(" & ");
}

export function resolveNickname(
  fullName: string,
  nickname: string | null,
): string {
  return nickname && nickname.trim().length > 0 ? nickname : fullName;
}

export function formatNameWithNickname(
  fullName: string,
  nickname: string | null,
): string {
  return nickname && nickname.trim().length > 0
    ? `${fullName} (${nickname})`
    : fullName;
}

export function computeCanExtend(
  status: string,
  dueDate: Date | null,
): boolean {
  if (status !== "active" || !dueDate) return false;
  const daysUntilDue = daysBetween(todayInJakarta(), dueDate);
  return daysUntilDue >= 0 && daysUntilDue <= 30;
}

export function confirmedExtensionCount(
  latestPeriod: { sequence: number; startDate: Date | null } | null | undefined,
): number {
  if (!latestPeriod) return 0;
  const confirmed = latestPeriod.startDate
    ? latestPeriod.sequence - 1
    : latestPeriod.sequence - 2;
  return Math.max(0, confirmed);
}

export const REQUIRED_DOCUMENT_TYPES = [
  "signed_contract",
  "deposit_proof",
  "ktp_scan",
] as const;

export function requiredDocumentTypesForPeriod(
  isExtension: boolean,
): readonly string[] {
  return isExtension ? ["signed_contract"] : REQUIRED_DOCUMENT_TYPES;
}

export { DOCUMENT_TYPE_LABELS, getDocumentTypeLabel } from "@/lib/labels";

export function requestNeedsAction(req: {
  status: string;
  instrumentConfirmed: boolean;
  loanPeriods: { addendums: { timing: string }[] }[];
}): boolean {
  if (req.status === "submitted") return true;
  if (req.status === "reviewing" && !req.instrumentConfirmed) return true;
  if (req.status === "documents_uploaded") return true;
  if (
    req.status === "ready_to_pickup" &&
    req.loanPeriods[0]?.addendums.some((a) => a.timing === "initial")
  ) {
    return true;
  }
  return false;
}

export function isReturnPending(req: {
  status: string;
  loanPeriods: {
    actualReturnDate: Date | null;
    addendums: { timing: string }[];
  }[];
}): boolean {
  const latestPeriod = req.loanPeriods[0];
  if (!latestPeriod) return false;
  return (
    (req.status === "active" || req.status === "overdue") &&
    !latestPeriod.actualReturnDate &&
    latestPeriod.addendums.some((a) => a.timing === "final")
  );
}

export function isExtensionPending(req: {
  status: string;
  loanPeriods: { periodType: string; startDate: Date | null }[];
}): boolean {
  const latestPeriod = req.loanPeriods[0];
  if (!latestPeriod) return false;
  return (
    req.status === "active" &&
    latestPeriod.periodType === "extension" &&
    !latestPeriod.startDate
  );
}

export function getRequestActionLabel(req: {
  status: string;
  instrumentConfirmed: boolean;
  loanPeriods: {
    periodType: string;
    startDate: Date | null;
    actualReturnDate: Date | null;
    addendums: { timing: string }[];
  }[];
}): string {
  if (req.status === "submitted") {
    return "Needs instrument assignment";
  }
  if (req.status === "reviewing" && !req.instrumentConfirmed) {
    return "Needs confirmation";
  }
  if (req.status === "documents_uploaded") {
    return "Needs document review";
  }
  if (isReturnPending(req)) {
    return "Needs return confirmation";
  }
  if (isExtensionPending(req)) {
    return "Needs extension confirmation";
  }

  return "Needs handover confirmation";
}

export function waitingOnBorrowerLabel(status: string): string {
  switch (status) {
    case "contract_generated":
      return "Waiting for borrower to upload documents";
    case "reviewing":
      return "Waiting for borrower to fill in contract details";
    case "ready_to_pickup":
      return "Waiting for pickup";
    default:
      return "Waiting on borrower";
  }
}

export type LoanStage =
  | "fill_contract_details"
  | "sign_contract"
  | "sign_extension_contract"
  | "pickup"
  | "extension_addendum"
  | "confirm_extension"
  | "confirm_return"
  | "confirm_pickup"
  | "review_documents"
  | "review_extension_documents"
  | "review_request"
  | "on_loan"
  | "return_overdue";

export type LoanStageInput = {
  status: BorrowingRequestStatus;
  instrumentConfirmed: boolean;
  hasInitialAddendum: boolean;
  hasFinalAddendum: boolean;
  isExtensionPeriod: boolean;
  needsExtensionDocuments: boolean;
  canFillExtensionAddendum: boolean;
  hasPendingExtension: boolean;
};

export function getLoanStage(data: LoanStageInput): LoanStage | null {
  if (data.status === "reviewing" && data.instrumentConfirmed) {
    return "fill_contract_details";
  }
  if (data.status === "contract_generated") return "sign_contract";
  if (data.needsExtensionDocuments) return "sign_extension_contract";
  if (data.status === "ready_to_pickup" && !data.hasInitialAddendum) {
    return "pickup";
  }
  if (data.canFillExtensionAddendum) return "extension_addendum";
  if (data.hasPendingExtension && data.hasInitialAddendum) {
    return "confirm_extension";
  }
  if (
    (data.status === "active" || data.status === "overdue") &&
    data.hasFinalAddendum
  ) {
    return "confirm_return";
  }
  if (data.status === "ready_to_pickup" && data.hasInitialAddendum) {
    return "confirm_pickup";
  }
  if (data.status === "documents_uploaded") return "review_documents";
  if (data.isExtensionPeriod && !data.hasInitialAddendum) {
    return "review_extension_documents";
  }
  if (
    (data.status === "submitted" || data.status === "reviewing") &&
    !data.instrumentConfirmed
  ) {
    return "review_request";
  }
  if (data.status === "active") return "on_loan";
  if (data.status === "overdue") return "return_overdue";
  return null;
}

export type StatusTurn = {
  actor: "borrower" | "staff";
  message: string;
};

const CONTRACT_READY_MESSAGE =
  "Kontrak kamu udah siap! Download, pahami kontraknya, tanda tangan, lalu upload lagi bareng dokumen pendukung lainnya.";

const BORROWER_TURNS: Partial<Record<LoanStage, StatusTurn>> = {
  fill_contract_details: {
    actor: "borrower",
    message:
      "Instrumen kamu udah dikonfirmasi tersedia! Isi data di bawah ini untuk lanjut proses kontrak peminjaman.",
  },
  sign_contract: { actor: "borrower", message: CONTRACT_READY_MESSAGE },
  sign_extension_contract: {
    actor: "borrower",
    message: CONTRACT_READY_MESSAGE,
  },
  pickup: {
    actor: "borrower",
    message:
      "Instrumen kamu udah siap diambil! Atur jadwal pengambilan dengan staf Logistik OSUI lewat kontak di bawah (atau cek email), terus isi kondisi awalnya di form bawah.",
  },
  extension_addendum: {
    actor: "borrower",
    message:
      "Dokumen perpanjangan kamu udah disetujui! Isi addendum kondisi di bawah ya.",
  },
  confirm_extension: {
    actor: "staff",
    message:
      "Addendum perpanjangan kamu udah terkirim. Tinggal nunggu konfirmasi staf.",
  },
  confirm_return: {
    actor: "staff",
    message:
      "Addendum pengembalian udah terkirim. Tinggal nunggu staf konfirmasi pengembalian di Sekre.",
  },
  confirm_pickup: {
    actor: "staff",
    message: "Addendum kamu udah terkirim. Tinggal nunggu konfirmasi staf.",
  },
  review_documents: {
    actor: "staff",
    message: "Dokumen kamu lagi dicek staf.",
  },
  review_extension_documents: {
    actor: "staff",
    message: "Dokumen perpanjangan kamu lagi dicek staf.",
  },
  review_request: {
    actor: "staff",
    message:
      "Staf sedang mereview pengajuan dan mengecek ketersediaan instrumen kamu.",
  },
};

export function getStatusTurn(data: LoanStageInput): StatusTurn | null {
  const stage = getLoanStage(data);
  return (stage && BORROWER_TURNS[stage]) ?? null;
}

export function displayedDueDate(
  latestPeriod: {
    dueDate: Date;
    startDate: Date | null;
    periodType: string;
  } | null,
  previousPeriod: { dueDate: Date } | null,
): Date | null {
  if (!latestPeriod) return null;
  const extensionPending =
    latestPeriod.periodType === "extension" && !latestPeriod.startDate;
  return extensionPending
    ? (previousPeriod?.dueDate ?? null)
    : latestPeriod.dueDate;
}

export type AdminStatusNote = {
  kind: "waiting" | "info";
  title: string;
  message: string;
};

function waitingForBorrower(message: string): AdminStatusNote {
  return { kind: "waiting", title: "Waiting for borrower", message };
}

const ADMIN_STATUS_NOTES: Partial<Record<LoanStage, AdminStatusNote>> = {
  fill_contract_details: waitingForBorrower("Filling in contract details."),
  sign_contract: waitingForBorrower(
    "Signing the contract and uploading the required documents.",
  ),
  sign_extension_contract: waitingForBorrower(
    "Signing the extension contract and uploading it.",
  ),
  pickup: waitingForBorrower(
    "Picking up the instrument at Sekre and submitting the initial condition addendum.",
  ),
  extension_addendum: waitingForBorrower(
    "Submitting the extension condition addendum.",
  ),
  on_loan: {
    kind: "info",
    title: "Loan in progress",
    message: "The borrower holds the instrument until it is returned.",
  },
  return_overdue: waitingForBorrower(
    "Returning the overdue instrument to Sekre.",
  ),
};

export function getAdminStatusNote(
  data: LoanStageInput,
): AdminStatusNote | null {
  const stage = getLoanStage(data);
  return (stage && ADMIN_STATUS_NOTES[stage]) ?? null;
}
