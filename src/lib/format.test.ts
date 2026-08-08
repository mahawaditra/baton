import { describe, it, expect } from "vitest";
import { daysBetween } from "./format";

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
