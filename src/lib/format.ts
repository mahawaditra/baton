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

export function formatRelativeDays(
  from: Date,
  today: Date = todayInJakarta(),
): string {
  const days = daysBetween(toJakartaCalendarDate(from), today);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
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
