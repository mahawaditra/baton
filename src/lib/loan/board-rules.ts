import { daysBetween, todayInJakarta } from "@/lib/format";
import {
  REQUIRED_DOCUMENT_TYPES,
  getRequestActionLabel,
  isExtensionPending,
  isReturnPending,
  requestNeedsAction,
  waitingOnBorrowerLabel,
} from "./loan-rules";

export const BOARD_COLUMNS = [
  { key: "requested", label: "Diajukan" },
  { key: "in_review", label: "Ditinjau" },
  { key: "document_review", label: "Review Dokumen" },
  { key: "handover", label: "Handover" },
  { key: "on_loan", label: "Sedang Dipinjam" },
  { key: "ongoing", label: "Ongoing" },
] as const;

export type BoardColumn = (typeof BOARD_COLUMNS)[number]["key"];

export function getBoardColumn(req: {
  status: string;
  instrumentConfirmed: boolean;
  carriedOverAt: Date | null;
}): BoardColumn | null {
  switch (req.status) {
    case "submitted":
      return "requested";
    case "reviewing":
      return req.instrumentConfirmed ? "in_review" : "requested";
    case "contract_generated":
      return "in_review";
    case "documents_uploaded":
      return "document_review";
    case "ready_to_pickup":
      return "handover";
    case "active":
    case "overdue":
      return req.carriedOverAt ? "ongoing" : "on_loan";
    default:
      return null;
  }
}

export type BoardChipTone = "action" | "waiting" | "ok" | "late";

type BoardChip = { tone: BoardChipTone; label: string };

function formatDayCount(count: number): string {
  return `${count} ${count === 1 ? "day" : "days"}`;
}

export function getBoardChip(
  req: {
    status: string;
    instrumentConfirmed: boolean;
    loanPeriods: {
      periodType: string;
      startDate: Date | null;
      dueDate: Date;
      actualReturnDate: Date | null;
      documents: { reviewStatus: string }[];
      addendums: { timing: string }[];
    }[];
  },
  today: Date = todayInJakarta(),
): BoardChip | null {
  const latestPeriod = req.loanPeriods[0];

  if (req.status === "active" || req.status === "overdue") {
    if (isReturnPending(req) || isExtensionPending(req)) {
      return { tone: "action", label: getRequestActionLabel(req) };
    }
    if (!latestPeriod) return null;

    const daysLeft = daysBetween(today, latestPeriod.dueDate);
    if (req.status === "overdue" || daysLeft < 0) {
      const daysLate = -daysLeft;
      return {
        tone: "late",
        label: daysLate > 0 ? `Overdue ${formatDayCount(daysLate)}` : "Overdue",
      };
    }
    if (daysLeft === 0) return { tone: "ok", label: "Due today" };
    return { tone: "ok", label: `${formatDayCount(daysLeft)} left` };
  }

  if (requestNeedsAction(req)) {
    return { tone: "action", label: getRequestActionLabel(req) };
  }

  if (req.status === "contract_generated") {
    const hasRejectedDocument =
      latestPeriod?.documents.some((d) => d.reviewStatus === "rejected") ??
      false;
    return {
      tone: "waiting",
      label: hasRejectedDocument
        ? "Document rejected, waiting for re-upload"
        : waitingOnBorrowerLabel(req.status),
    };
  }

  if (req.status === "reviewing" || req.status === "ready_to_pickup") {
    return { tone: "waiting", label: waitingOnBorrowerLabel(req.status) };
  }

  return null;
}

export function getDocumentApprovalProgress(req: {
  status: string;
  loanPeriods: { documents: { reviewStatus: string }[] }[];
}): { approved: number; total: number } | null {
  if (req.status !== "documents_uploaded" && req.status !== "contract_generated") {
    return null;
  }

  const documents = req.loanPeriods[0]?.documents ?? [];
  const hasRejectedDocument = documents.some(
    (d) => d.reviewStatus === "rejected",
  );
  if (req.status === "contract_generated" && !hasRejectedDocument) return null;

  return {
    approved: documents.filter((d) => d.reviewStatus === "approved").length,
    total: REQUIRED_DOCUMENT_TYPES.length,
  };
}

type BoardSortInput = Parameters<typeof getBoardChip>[0] & { createdAt: Date };

const BOARD_TONE_PRIORITY: Record<BoardChipTone, number> = {
  late: 0,
  action: 1,
  waiting: 2,
  ok: 3,
};

export type BoardSortDirection = "oldest" | "newest";

export function compareBoardRequests(
  a: BoardSortInput,
  b: BoardSortInput,
  today: Date = todayInJakarta(),
  direction: BoardSortDirection = "oldest",
): number {
  const toneA = getBoardChip(a, today)?.tone ?? "waiting";
  const toneB = getBoardChip(b, today)?.tone ?? "waiting";
  const byTone = BOARD_TONE_PRIORITY[toneA] - BOARD_TONE_PRIORITY[toneB];
  if (byTone !== 0) return byTone;

  const byDate = a.createdAt.getTime() - b.createdAt.getTime();
  return direction === "oldest" ? byDate : -byDate;
}
