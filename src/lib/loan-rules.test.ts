import { describe, it, expect } from "vitest";
import {
  calculateDepositRefund,
  determineInstrumentStatusOnReturn,
} from "./loan-rules";

describe("calculateDepositRefund", () => {
  const base = {
    depositAmount: 100_000,
    depositGraceDays: 14,
    depositPartialAmount: 50_000,
  };

  it("full refund when returned on time or early", () => {
    expect(calculateDepositRefund({ ...base, daysLate: 0 })).toBe(100_000);
    expect(calculateDepositRefund({ ...base, daysLate: -3 })).toBe(100_000);
  });
  it("partial refund within grace period", () => {
    expect(calculateDepositRefund({ ...base, daysLate: 1 })).toBe(50_000);
    expect(calculateDepositRefund({ ...base, daysLate: 14 })).toBe(50_000);
  });
  it("no refund beyond grace period", () => {
    expect(calculateDepositRefund({ ...base, daysLate: 15 })).toBe(0);
  });
});

describe("determineInstrumentStatusOnReturn", () => {
  it("forces unavailable when retired or lost, regardless of requested status", () => {
    expect(determineInstrumentStatusOnReturn("retired", "available")).toBe(
      "unavailable",
    );
    expect(determineInstrumentStatusOnReturn("lost", "available")).toBe(
      "unavailable",
    );
  });
  it("respects requested status for ok/need_repair", () => {
    expect(determineInstrumentStatusOnReturn("ok", "available")).toBe(
      "available",
    );
    expect(
      determineInstrumentStatusOnReturn("need_repair", "unavailable"),
    ).toBe("unavailable");
  });
});
