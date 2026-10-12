import { describe, it, expect } from "vitest";
import {
  ARCHIVE_STATUSES,
  buildArchiveHref,
  buildArchiveWhere,
  parseArchiveStatus,
  parseArchiveYear,
} from "./archive-query";

describe("parseArchiveYear", () => {
  it("accepts a four-digit year only", () => {
    expect(parseArchiveYear("2026")).toBe(2026);
    expect(parseArchiveYear("26")).toBeNull();
    expect(parseArchiveYear("abcd")).toBeNull();
    expect(parseArchiveYear(undefined)).toBeNull();
  });
});

describe("parseArchiveStatus", () => {
  it("accepts only archive statuses", () => {
    expect(parseArchiveStatus("rejected")).toBe("rejected");
    expect(parseArchiveStatus("active")).toBeUndefined();
    expect(parseArchiveStatus(undefined)).toBeUndefined();
  });
});

describe("buildArchiveHref", () => {
  it("returns the bare path without params", () => {
    expect(buildArchiveHref({})).toBe("/archive");
  });

  it("keeps both year and status", () => {
    expect(buildArchiveHref({ year: 2026, status: "cancelled" })).toBe(
      "/archive?year=2026&status=cancelled",
    );
  });

  it("skips an empty year", () => {
    expect(buildArchiveHref({ year: null, status: "returned" })).toBe(
      "/archive?status=returned",
    );
  });
});

describe("buildArchiveWhere", () => {
  it("covers every archive status when none is chosen", () => {
    const where = buildArchiveWhere({ year: null, status: undefined });
    expect(where.status).toEqual({ in: [...ARCHIVE_STATUSES] });
    expect(where.AND).toEqual([]);
    expect(where.createdAt).toBeUndefined();
  });

  it("filters to a single status", () => {
    const where = buildArchiveWhere({ year: null, status: "rejected" });
    expect(where.status).toBe("rejected");
  });

  it("bounds the year by Jakarta midnight", () => {
    const where = buildArchiveWhere({ year: 2026, status: undefined });
    expect(where.createdAt).toEqual({
      gte: new Date("2025-12-31T17:00:00.000Z"),
      lt: new Date("2026-12-31T17:00:00.000Z"),
    });
  });

  it("matches the borrower by name or nickname", () => {
    const where = buildArchiveWhere({
      year: null,
      status: undefined,
      borrower: "rey",
    });
    expect(where.AND).toEqual([
      {
        OR: [
          { borrowerName: { contains: "rey", mode: "insensitive" } },
          { borrowerNickname: { contains: "rey", mode: "insensitive" } },
        ],
      },
    ]);
  });

  it("matches the instrument by assigned type, serial, or requested type", () => {
    const where = buildArchiveWhere({
      year: null,
      status: undefined,
      instrument: "trumpet",
    });
    const [filter] = where.AND as { OR: unknown[] }[];
    expect(filter.OR).toHaveLength(3);
    expect(filter.OR).toContainEqual({
      instrumentTypeRequested: { contains: "trumpet", mode: "insensitive" },
    });
  });
});
