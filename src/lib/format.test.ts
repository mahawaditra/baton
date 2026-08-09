import { describe, it, expect } from "vitest";
import { daysBetween } from "./format";
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
