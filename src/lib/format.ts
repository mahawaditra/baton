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

function diffFields(
  before: Record<string, any> | undefined,
  after: Record<string, any> | undefined,
  fields: string[],
): string[] {
  if (!before || !after) return [];
  return fields
    .filter((f) => before[f] !== after[f])
    .map((f) => `${f}: ${before[f]} → ${after[f]}`);
}

export function formatActivityLog(log: ActivityLogLike): string {
  const meta = (log.metadata ?? {}) as Record<string, any>;

  switch (log.action) {
    case "update_instrument": {
      const changes = diffFields(meta.before, meta.after, [
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
      return `rejected request${meta.reason ? `: ${meta.reason}` : ""}`;
    case "approve_documents":
      return `approved ${meta.type ?? "a document"}`;
    case "reject_documents":
      return `rejected ${meta.type ?? "a document"}${meta.notes ? `: ${meta.notes}` : ""}`;
    case "confirm_ready":
      return "confirmed documents, request ready for pickup";
    case "confirm_handover":
      return "confirmed instrument handover";
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
