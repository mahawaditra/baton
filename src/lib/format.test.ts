import { describe, it, expect } from "vitest";
import { daysBetween, formatActivityLog } from "./format";
import { toJakartaCalendarDate } from "./format";

function log(action: string, metadata: unknown) {
  return {
    action,
    entityType: "borrowing_request",
    entityId: "irrelevant",
    metadata,
    admin: { name: "Zenka" },
    createdAt: new Date(),
  };
}

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

describe("formatActivityLog", () => {
  it("lists only the fields that actually changed on update_instrument", () => {
    const before = { condition: "need_repair", status: "available", location: "Sekre" };
    const after = { condition: "ok", status: "available", location: "Sekre" };
    expect(formatActivityLog(log("update_instrument", { before, after }))).toBe(
      "updated instrument (condition: need_repair → ok)",
    );
  });

  it("falls back to a plain message when nothing tracked actually changed", () => {
    const same = { condition: "ok", status: "available", location: "Sekre" };
    expect(
      formatActivityLog(log("update_instrument", { before: same, after: same })),
    ).toBe("updated instrument");
  });

  it("includes the reason on reject_request when one was given", () => {
    expect(
      formatActivityLog(
        log("reject_request", { reason: "Data tidak lengkap", releasedInstrumentId: null }),
      ),
    ).toBe("rejected request: Data tidak lengkap");
  });

  it("omits the colon on reject_request when there is no reason", () => {
    expect(
      formatActivityLog(
        log("reject_request", { reason: "", releasedInstrumentId: null }),
      ),
    ).toBe("rejected request");
  });

  it("names the document type on approve_documents", () => {
    expect(
      formatActivityLog(
        log("approve_documents", { documentId: "d1", type: "ktp_scan", notes: null }),
      ),
    ).toBe("approved ktp_scan");
  });

  it("includes the reviewer notes on reject_documents when present", () => {
    expect(
      formatActivityLog(
        log("reject_documents", {
          documentId: "d1",
          type: "deposit_proof",
          notes: "Nominal tidak sesuai",
        }),
      ),
    ).toBe("rejected deposit_proof: Nominal tidak sesuai");
  });

  it("names the label and count on export_snapshot", () => {
    expect(
      formatActivityLog(
        log("export_snapshot", { label: "Post Calang", instrumentCount: 42 }),
      ),
    ).toBe('exported inventory snapshot "Post Calang" (42 instruments)');
  });

  it("includes the reason on cancel_request when one was given", () => {
    expect(
      formatActivityLog(
        log("cancel_request", { reason: "Beli alat sendiri", releasedInstrumentId: null }),
      ),
    ).toBe("cancelled request: Beli alat sendiri");
  });

  it("falls back to a humanized action name for actions with no dedicated message", () => {
    expect(formatActivityLog(log("some_future_action", null))).toBe(
      "some future action",
    );
  });
});
