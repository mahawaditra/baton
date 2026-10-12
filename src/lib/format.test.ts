import { afterEach, describe, it, expect, vi } from "vitest";
import {
  currentYearInJakarta,
  daysBetween,
  driveTimestamp,
  formatCalendarDate,
  formatJakartaDate,
  formatJakartaDateTime,
  formatJakartaTime,
  formatRelativeDays,
  toWhatsAppNumber,
  splitFacultyMajor,
} from "./format";
import { toJakartaCalendarDate } from "./format";

describe("daysBetween", () => {
  it("returns 0 for the same day", () => {
    expect(daysBetween(new Date("2026-08-08"), new Date("2026-08-08"))).toBe(0);
  });
  it("returns positive when 'to' is later", () => {
    expect(daysBetween(new Date("2026-08-01"), new Date("2026-08-08"))).toBe(7);
  });
  it("returns negative when 'to' is earlier", () => {
    expect(daysBetween(new Date("2026-08-08"), new Date("2026-08-01"))).toBe(
      -7,
    );
  });
  it("ignores time-of-day, only counts calendar days", () => {
    const morning = new Date("2026-08-01T01:00:00Z");
    const night = new Date("2026-08-01T23:00:00Z");
    expect(daysBetween(morning, night)).toBe(0);
  });
});

describe("toWhatsAppNumber", () => {
  it("converts a leading zero to the 62 country code", () => {
    expect(toWhatsAppNumber("081234567890")).toBe("6281234567890");
  });
  it("strips spaces, dashes, and the plus sign", () => {
    expect(toWhatsAppNumber("+62 812-3456-7890")).toBe("6281234567890");
  });
  it("leaves an already-normalized number unchanged", () => {
    expect(toWhatsAppNumber("6281234567890")).toBe("6281234567890");
  });
  it("prepends 62 when there is no leading zero or country code", () => {
    expect(toWhatsAppNumber("81234567890")).toBe("6281234567890");
  });
});

describe("splitFacultyMajor", () => {
  it("splits a stored Faculty/Major string", () => {
    expect(splitFacultyMajor("FIB/Sastra Jepang")).toEqual({
      faculty: "FIB",
      major: "Sastra Jepang",
    });
  });
  it("keeps a slash inside the major intact", () => {
    expect(splitFacultyMajor("FT/Teknik Elektro/Telekomunikasi")).toEqual({
      faculty: "FT",
      major: "Teknik Elektro/Telekomunikasi",
    });
  });
  it("returns empty strings for null / undefined / no slash", () => {
    expect(splitFacultyMajor(null)).toEqual({ faculty: "", major: "" });
    expect(splitFacultyMajor(undefined)).toEqual({ faculty: "", major: "" });
    expect(splitFacultyMajor("FIB")).toEqual({ faculty: "FIB", major: "" });
  });
  it("trims surrounding whitespace on each part", () => {
    expect(splitFacultyMajor(" FIB / Sastra Jepang ")).toEqual({
      faculty: "FIB",
      major: "Sastra Jepang",
    });
  });
});

describe("formatRelativeDays", () => {
  const today = new Date("2026-10-12T00:00:00Z");

  it("says Today for the same Jakarta calendar day", () => {
    expect(formatRelativeDays(new Date("2026-10-12T03:00:00Z"), today)).toBe(
      "Today",
    );
  });

  it("counts the Jakarta calendar day, not the UTC day", () => {
    expect(formatRelativeDays(new Date("2026-10-11T17:30:00Z"), today)).toBe(
      "Today",
    );
  });

  it("says Yesterday for one day ago", () => {
    expect(formatRelativeDays(new Date("2026-10-11T03:00:00Z"), today)).toBe(
      "Yesterday",
    );
  });

  it("says N days ago beyond yesterday", () => {
    expect(formatRelativeDays(new Date("2026-10-09T03:00:00Z"), today)).toBe(
      "3 days ago",
    );
  });
});

describe("toJakartaCalendarDate", () => {
  it("keeps the same calendar day before the WIB midnight rollover", () => {
    expect(toJakartaCalendarDate(new Date("2026-08-01T16:59:00Z"))).toEqual(
      new Date("2026-08-01T00:00:00Z"),
    );
  });
  it("rolls over to the next calendar day exactly at 17:00 UTC (00:00 WIB)", () => {
    expect(toJakartaCalendarDate(new Date("2026-08-01T17:00:00Z"))).toEqual(
      new Date("2026-08-02T00:00:00Z"),
    );
  });
  it("stays on the next calendar day through the rest of WIB's early morning", () => {
    expect(toJakartaCalendarDate(new Date("2026-08-01T23:59:00Z"))).toEqual(
      new Date("2026-08-02T00:00:00Z"),
    );
  });
});

describe('Jakarta date and time display', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the Jakarta calendar day, not the UTC day', () => {
    expect(formatJakartaDate(new Date('2026-01-04T22:00:00Z'))).toBe('05/01/2026');
    expect(formatJakartaDate(new Date('2026-01-04T16:59:00Z'))).toBe('04/01/2026');
  });

  it('shows the Jakarta wall-clock time in 24-hour form', () => {
    expect(formatJakartaTime(new Date('2026-01-04T22:30:00Z'))).toBe('05:30');
    expect(formatJakartaTime(new Date('2026-01-05T16:59:00Z'))).toBe('23:59');
    expect(formatJakartaTime(new Date('2026-01-05T17:00:00Z'))).toBe('00:00');
  });

  it('joins date and time for the activity feed', () => {
    expect(formatJakartaDateTime(new Date('2026-01-04T22:30:00Z'))).toBe(
      '05/01/2026, 05:30',
    );
  });

  it('shows a date-only column as stored, whatever timezone the reader is in', () => {
    const dueDate = new Date('2026-09-14T00:00:00Z');
    expect(formatCalendarDate(dueDate)).toBe('14/09/2026');
    expect(formatCalendarDate(dueDate, 'id-ID')).toBe('14/9/2026');
  });

  it('rolls the year over at midnight Jakarta time, not midnight UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-31T16:59:00Z'));
    expect(currentYearInJakarta()).toBe(2025);
    vi.setSystemTime(new Date('2025-12-31T17:00:00Z'));
    expect(currentYearInJakarta()).toBe(2026);
  });

  it('stamps Drive file names with the Jakarta date', () => {
    expect(driveTimestamp(new Date('2026-01-04T22:00:00Z'))).toBe('20260105');
  });
});
