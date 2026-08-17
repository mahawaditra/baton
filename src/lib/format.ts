import type { Instrument, Good, LoanSetting } from "@/generated/prisma/client";

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
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}${m}${d}`;
}

type ActivityLogLike = {
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  admin: { name: string };
  createdAt: Date;
};

type ActivityMetadataByAction =
  | {
      action: "assign_instrument";
      metadata: { instrumentId: string; previousInstrumentId: string | null };
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
        | "add_admin"
        | "deactivate_admin"
        | "reactivate_admin";
      metadata: null;
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
  | { action: "create_goods"; metadata: { after: Good } };

function diffFields<T extends Record<string, unknown>>(
  before: T | undefined,
  after: T | undefined,
  fields: (keyof T)[],
): string[] {
  if (!before || !after) return [];
  return fields
    .filter((f) => before[f] !== after[f])
    .map((f) => `${String(f)}: ${before[f]} → ${after[f]}`);
}

export function formatActivityLog(log: ActivityLogLike): string {
  const typed = log as ActivityLogLike & ActivityMetadataByAction;

  switch (typed.action) {
    case "update_instrument": {
      const changes = diffFields(typed.metadata.before, typed.metadata.after, [
        "condition",
        "status",
        "location",
      ]);
      return changes.length > 0
        ? `updated instrument (${changes.join(", ")})`
        : "updated instrument";
    }
    case "assign_instrument":
      return "assigned an instrument";
    case "reject_request":
      return `rejected request${typed.metadata.reason ? `: ${typed.metadata.reason}` : ""}`;
    case "cancel_request":
      return `cancelled request${typed.metadata.reason ? `: ${typed.metadata.reason}` : ""}`;
    case "approve_documents":
      return `approved ${typed.metadata.type}`;
    case "reject_documents":
      return `rejected ${typed.metadata.type}${typed.metadata.notes ? `: ${typed.metadata.notes}` : ""}`;
    case "confirm_ready":
      return "confirmed documents, request ready for pickup";
    case "confirm_handover":
      return "confirmed instrument handover";
    case "confirm_extension":
      return "confirmed extension";
    case "confirm_return":
      return `confirmed return (condition: ${typed.metadata.condition}, refund: Rp${typed.metadata.depositRefundAmount.toLocaleString("id-ID")})`;
    case "update_goods": {
      const changes = diffFields(typed.metadata.before, typed.metadata.after, [
        "condition",
        "quantity",
        "location",
      ]);
      return changes.length > 0
        ? `updated goods (${changes.join(", ")})`
        : "updated goods";
    }
    case "update_loan_settings":
      return "updated loan settings";
    case "export_snapshot":
      return `exported inventory snapshot "${typed.metadata.label}" (${typed.metadata.instrumentCount} instruments)`;
    case "generate_annual_report":
      return `generated annual report for ${typed.metadata.year}`;
    case "notify_available":
      return "notified borrower to complete Stage 2";
    case "add_admin":
      return "added a new admin";
    case "deactivate_admin":
      return "deactivated an admin";
    case "reactivate_admin":
      return "reactivated an admin";
    case "create_instrument":
      return `created instrument (${typed.metadata.after.section}/${typed.metadata.after.type})`;
    case "create_goods":
      return `created goods (${typed.metadata.after.name})`;
    default:
      return log.action.replaceAll("_", " ");
  }
}

export function getEntityUrl(
  entityType: string,
  entityId: string,
): string | null {
  switch (entityType) {
    case "instrument":
      return `/admin/instruments/${entityId}`;
    case "borrowing_request":
      return `/admin/requests/${entityId}`;
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
