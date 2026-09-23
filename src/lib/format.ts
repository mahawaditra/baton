import type { Instrument, Good, LoanSetting } from "@/generated/prisma/client";
import {
  getConditionLabel,
  getDocumentTypeLabel,
  getRequestStatusLabel,
  getRoleLabel,
  getStatusLabel,
} from "@/lib/labels";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function driveTimestamp(date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const jakarta = toJakartaCalendarDate(date);
  const y = jakarta.getUTCFullYear();
  const m = pad(jakarta.getUTCMonth() + 1);
  const d = pad(jakarta.getUTCDate());
  return `${y}${m}${d}`;
}

const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const jakartaDateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: JAKARTA_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const jakartaTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: JAKARTA_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatJakartaDate(date: Date | string | number): string {
  return jakartaDateFormat.format(new Date(date));
}

export function formatJakartaTime(date: Date | string | number): string {
  return jakartaTimeFormat.format(new Date(date));
}

export function formatJakartaDateTime(date: Date | string | number): string {
  return `${formatJakartaDate(date)}, ${formatJakartaTime(date)}`;
}

export function formatCalendarDate(
  date: Date | string | number,
  locale = "en-GB",
): string {
  return new Date(date).toLocaleDateString(locale, { timeZone: "UTC" });
}

export function currentYearInJakarta(): number {
  return todayInJakarta().getUTCFullYear();
}

export const FORMER_MEMBER_LABEL = "Former member";

export function resolveActorName(
  live: { name: string } | null | undefined,
  snapshotName: string | null | undefined,
): string {
  return live?.name ?? snapshotName ?? FORMER_MEMBER_LABEL;
}

type ActivityLogLike = {
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: Date;
};

type ActivityMetadataByAction =
  | {
      action: "assign_instrument";
      metadata: {
        instrumentId: string;
        previousInstrumentId: string | null;
        instrumentType: string | null;
        instrumentSerial: string | null;
      };
    }
  | { action: "notify_available"; metadata: { notifiedEmail: string } }
  | {
      action: "approve_documents" | "reject_documents";
      metadata: { documentId: string; type: string; notes: string | null };
    }
  | {
      action:
        | "confirm_ready"
        | "confirm_handover"
        | "confirm_extension"
        | "revert_from_ongoing"
        | "complete_handover";
      metadata: null;
    }
  | {
      action: "handover_ketua";
      metadata: {
        newKetua: { name: string; email: string };
        deletedStaff: string[];
      };
    }
  | {
      action: "add_admin" | "deactivate_admin" | "reactivate_admin";
      metadata: { name: string; email: string; role?: string };
    }
  | {
      action: "update_instrument_type_slot";
      metadata: { instrumentType: string; before: number; after: number };
    }
  | {
      action: "confirm_return";
      metadata: {
        condition: string;
        status: string;
        depositRefundAmount: number;
        daysLate: number;
      };
    }
  | {
      action: "update_instrument";
      metadata: { before: Instrument; after: Instrument };
    }
  | { action: "update_goods"; metadata: { before: Good; after: Good } }
  | {
      action: "update_loan_settings";
      metadata: { before?: LoanSetting; after: LoanSetting };
    }
  | {
      action: "export_snapshot";
      metadata: { label: string; instrumentCount: number };
    }
  | {
      action: "generate_annual_report";
      metadata: { year: number; reportId: string };
    }
  | {
      action: "reject_request" | "cancel_request";
      metadata: { reason: string; releasedInstrumentId: string | null };
    }
  | { action: "create_instrument"; metadata: { after: Instrument } }
  | { action: "create_goods"; metadata: { after: Good } }
  | { action: "transfer_to_ongoing"; metadata: { count: number } };

const conditionValue = (value: unknown) => getConditionLabel(String(value));
const statusValue = (value: unknown) => getStatusLabel(String(value));

function diffFields<T extends Record<string, unknown>>(
  before: T | undefined,
  after: T | undefined,
  fields: (keyof T)[],
  formatters: Partial<Record<keyof T, (value: unknown) => string>> = {},
): string[] {
  if (!before || !after) return [];
  const show = (field: keyof T, value: unknown) =>
    formatters[field]?.(value) ?? String(value);
  return fields
    .filter((f) => before[f] !== after[f])
    .map((f) => `${String(f)}: ${show(f, before[f])} → ${show(f, after[f])}`);
}

function changedFieldNames<T extends Record<string, unknown>>(
  before: T | undefined,
  after: T | undefined,
  fields: (keyof T)[],
): string[] {
  if (!before || !after) return [];
  return fields.filter((f) => before[f] !== after[f]).map(String);
}

export function formatActivityLog(log: ActivityLogLike): string {
  const typed = log as ActivityLogLike & ActivityMetadataByAction;

  switch (typed.action) {
    case "update_instrument": {
      const changes = diffFields(
        typed.metadata.before,
        typed.metadata.after,
        ["condition", "status", "location"],
        { condition: conditionValue, status: statusValue },
      );
      return changes.length > 0
        ? `updated instrument (${changes.join(", ")})`
        : "updated instrument";
    }
    case "assign_instrument": {
      const { instrumentType, instrumentSerial } = typed.metadata;
      if (!instrumentType) return "assigned an instrument";
      return `assigned ${instrumentType}${instrumentSerial ? ` (${instrumentSerial})` : ""}`;
    }
    case "reject_request":
      return `rejected request${typed.metadata.reason ? `: ${typed.metadata.reason}` : ""}`;
    case "cancel_request":
      return `cancelled request${typed.metadata.reason ? `: ${typed.metadata.reason}` : ""}`;
    case "approve_documents":
      return `approved ${getDocumentTypeLabel(typed.metadata.type)}`;
    case "reject_documents":
      return `rejected ${getDocumentTypeLabel(typed.metadata.type)}${typed.metadata.notes ? `: ${typed.metadata.notes}` : ""}`;
    case "confirm_ready":
      return "confirmed documents, request ready for pickup";
    case "confirm_handover":
      return "confirmed instrument handover";
    case "confirm_extension":
      return "confirmed extension";
    case "confirm_return":
      return `confirmed return (condition: ${getConditionLabel(typed.metadata.condition)}, refund: Rp${typed.metadata.depositRefundAmount.toLocaleString("id-ID")})`;
    case "update_goods": {
      const changes = diffFields(
        typed.metadata.before,
        typed.metadata.after,
        ["condition", "quantity", "location"],
        { condition: conditionValue },
      );
      return changes.length > 0
        ? `updated goods (${changes.join(", ")})`
        : "updated goods";
    }
    case "update_loan_settings": {
      const { before, after } = typed.metadata;
      const changes = changedFieldNames(before, after, [
        "depositAmount",
        "depositPartialAmount",
        "depositGraceDays",
        "bankName",
        "bankAccount",
        "bankHolder",
        "signatoryName",
        "signatoryPhone",
        "signatoryLineId",
        "signatoryAddressKtp",
        "signatoryAddressDomicile",
        "signatoryFaculty",
        "signatoryYear",
        "signatorySection",
        "signatoryKtpNumber",
        "signatoryPhonePublic",
        "signatoryLineAddFriendUrl",
        "signatoryLineAddFriendPublic",
      ]);
      if (before && after) {
        if (
          new Date(before.dueDate).getTime() !==
          new Date(after.dueDate).getTime()
        ) {
          changes.push("dueDate");
        }
        if (before.signatoryImageDriveId !== after.signatoryImageDriveId) {
          changes.push("signatureImage");
        }
      }
      return changes.length > 0
        ? `updated loan settings (${changes.join(", ")})`
        : "updated loan settings";
    }
    case "update_instrument_type_slot":
      return `updated ${typed.metadata.instrumentType} slot (${typed.metadata.before} → ${typed.metadata.after})`;
    case "export_snapshot":
      return `exported inventory snapshot "${typed.metadata.label}" (${typed.metadata.instrumentCount} instruments)`;
    case "generate_annual_report":
      return `generated annual report for ${typed.metadata.year}`;
    case "transfer_to_ongoing":
      return `moved ${typed.metadata.count} ${typed.metadata.count === 1 ? "loan" : "loans"} to ongoing loans`;
    case "revert_from_ongoing":
      return "moved a loan back to the active roster";
    case "notify_available":
      return "notified borrower to complete Stage 2";
    case "add_admin":
      return `added a new ${typed.metadata.role ? getRoleLabel(typed.metadata.role) : "admin"} (${typed.metadata.name}, ${typed.metadata.email})`;
    case "deactivate_admin":
      return `deactivated ${typed.metadata.name} (${typed.metadata.email})`;
    case "reactivate_admin":
      return `reactivated ${typed.metadata.name} (${typed.metadata.email})`;
    case "handover_ketua":
      return `handed over the Ketua position to ${typed.metadata.newKetua.name} (${typed.metadata.newKetua.email}) and removed ${typed.metadata.deletedStaff.length} staff`;
    case "complete_handover":
      return "completed the handover and left BATON";
    case "create_instrument":
      return `created instrument (${typed.metadata.after.section}/${typed.metadata.after.type})`;
    case "create_goods":
      return `created goods (${typed.metadata.after.name})`;
    default:
      return log.action.replaceAll("_", " ");
  }
}

export function buildAnnualSummaryRows(params: {
  year: number;
  periodEnd: Date;
  activeLoans: number;
  requestsThisYear: number;
  statusBreakdown: { status: string; _count: number }[];
  revitalizedCount: number;
}) {
  const {
    year,
    periodEnd,
    activeLoans,
    requestsThisYear,
    statusBreakdown,
    revitalizedCount,
  } = params;

  return [
    { Metric: "Active Loans", Value: activeLoans },
    {
      Metric: `Requests Created (Jan 1, ${year} - ${formatCalendarDate(periodEnd)})`,
      Value: requestsThisYear,
    },
    ...statusBreakdown.map((s) => ({
      Metric: `  Status: ${getRequestStatusLabel(s.status)}`,
      Value: s._count,
    })),
    {
      Metric: `Instruments Repaired (${getConditionLabel("need_repair")} → ${getConditionLabel("ok")})`,
      Value: revitalizedCount,
    },
  ];
}

export function getEntityUrl(
  entityType: string,
  entityId: string,
): string | null {
  switch (entityType) {
    case "instrument":
      return `/instruments/${entityId}`;
    case "borrowing_request":
      return `/requests/${entityId}`;
    default:
      return null;
  }
}

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const fromMidnight = Date.UTC(
    from.getUTCFullYear(),
    from.getUTCMonth(),
    from.getUTCDate(),
  );
  const toMidnight = Date.UTC(
    to.getUTCFullYear(),
    to.getUTCMonth(),
    to.getUTCDate(),
  );
  return Math.floor((toMidnight - fromMidnight) / msPerDay);
}

export function toJakartaCalendarDate(date: Date): Date {
  const jakartaOffsetMs = 7 * 60 * 60 * 1000;
  const shifted = new Date(date.getTime() + jakartaOffsetMs);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ),
  );
}

export function todayInJakarta(): Date {
  return toJakartaCalendarDate(new Date());
}

export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

export function splitFacultyMajor(value: string | null | undefined): {
  faculty: string;
  major: string;
} {
  const [faculty = "", ...rest] = (value ?? "").split("/");
  return { faculty: faculty.trim(), major: rest.join("/").trim() };
}
