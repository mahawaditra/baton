import { daysBetween, todayInJakarta } from "@/lib/format";

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

export function determineInstrumentStatusOnReturn(
  condition: "ok" | "need_repair" | "retired" | "lost",
  requestedStatus: "available" | "unavailable",
): "available" | "unavailable" {
  return condition === "retired" || condition === "lost"
    ? "unavailable"
    : requestedStatus;
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

export function computeCanExtend(
  status: string,
  dueDate: Date | null,
): boolean {
  if (status !== "active" || !dueDate) return false;
  const daysUntilDue = daysBetween(todayInJakarta(), dueDate);
  return daysUntilDue >= 0 && daysUntilDue <= 30;
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

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  signed_contract: "Kontrak yang Ditandatangani",
  deposit_proof: "Bukti Transfer Deposit",
  ktp_scan: "Scan KTP",
};

export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}

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

  const latestPeriod = req.loanPeriods[0];

  if (
    latestPeriod &&
    (req.status === "active" || req.status === "overdue") &&
    !latestPeriod.actualReturnDate &&
    latestPeriod.addendums.some((a) => a.timing === "final")
  ) {
    return "Needs return confirmation";
  }

  if (
    latestPeriod &&
    req.status === "active" &&
    latestPeriod.periodType === "extension" &&
    !latestPeriod.startDate
  ) {
    return "Needs extension confirmation";
  }

  return "Needs handover confirmation";
}
