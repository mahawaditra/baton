import { describe, it, expect } from "vitest";
import {
  calculateDepositRefund,
  determineInstrumentStatusOnReturn,
  documentTypesNeedingUpload,
  canAssignInstrument,
  canNotifyBorrower,
  computeCanExtend,
  requiredDocumentTypesForPeriod,
  getRequestActionLabel,
} from "./loan-rules";
import { todayInJakarta } from "./format";

function daysFromToday(days: number): Date {
  const today = todayInJakarta();
  return new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
}

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

describe("documentTypesNeedingUpload", () => {
  const required = ["signed_contract", "deposit_proof", "ktp_scan"];

  it("returns every type when nothing has been uploaded yet", () => {
    expect(documentTypesNeedingUpload(required, [])).toEqual(required);
  });

  it("excludes types that are already pending or approved", () => {
    const existing = [
      { type: "signed_contract", reviewStatus: "approved" },
      { type: "deposit_proof", reviewStatus: "pending" },
    ];
    expect(documentTypesNeedingUpload(required, existing)).toEqual([
      "ktp_scan",
    ]);
  });

  it("includes a type again if its existing document was rejected", () => {
    const existing = [
      { type: "signed_contract", reviewStatus: "approved" },
      { type: "deposit_proof", reviewStatus: "approved" },
      { type: "ktp_scan", reviewStatus: "rejected" },
    ];
    expect(documentTypesNeedingUpload(required, existing)).toEqual([
      "ktp_scan",
    ]);
  });
});

describe("canAssignInstrument", () => {
  it("allows assigning while submitted or reviewing and not yet confirmed", () => {
    expect(canAssignInstrument("submitted", false)).toBe(true);
    expect(canAssignInstrument("reviewing", false)).toBe(true);
  });

  it("blocks once the instrument has been confirmed", () => {
    expect(canAssignInstrument("reviewing", true)).toBe(false);
  });

  it("blocks once the request has moved past reviewing", () => {
    expect(canAssignInstrument("active", false)).toBe(false);
    expect(canAssignInstrument("ready_to_pickup", false)).toBe(false);
  });
});

describe("canNotifyBorrower", () => {
  it("allows notifying only while reviewing and not yet confirmed", () => {
    expect(canNotifyBorrower("reviewing", false)).toBe(true);
  });

  it("blocks while still submitted (instrument not assigned yet)", () => {
    expect(canNotifyBorrower("submitted", false)).toBe(false);
  });

  it("blocks once the instrument has already been confirmed", () => {
    expect(canNotifyBorrower("reviewing", true)).toBe(false);
  });
});

describe("computeCanExtend", () => {
  it("allows right up to 30 days before the due date", () => {
    expect(computeCanExtend("active", daysFromToday(30))).toBe(true);
    expect(computeCanExtend("active", daysFromToday(0))).toBe(true);
  });

  it("blocks beyond the 30-day window", () => {
    expect(computeCanExtend("active", daysFromToday(31))).toBe(false);
  });

  it("blocks once the due date has already passed", () => {
    expect(computeCanExtend("active", daysFromToday(-1))).toBe(false);
  });

  it("blocks when the request isn't active", () => {
    expect(computeCanExtend("overdue", daysFromToday(5))).toBe(false);
    expect(computeCanExtend("submitted", daysFromToday(5))).toBe(false);
  });

  it("blocks when there is no due date yet", () => {
    expect(computeCanExtend("active", null)).toBe(false);
  });
});

describe("requiredDocumentTypesForPeriod", () => {
  it("requires only the signed contract during an extension period", () => {
    expect(requiredDocumentTypesForPeriod(true)).toEqual(["signed_contract"]);
  });

  it("requires all 3 documents for the initial period", () => {
    expect(requiredDocumentTypesForPeriod(false)).toEqual([
      "signed_contract",
      "deposit_proof",
      "ktp_scan",
    ]);
  });
});

describe("getRequestActionLabel", () => {
  it("flags a fresh submission as needing instrument assignment", () => {
    expect(
      getRequestActionLabel({
        status: "submitted",
        instrumentConfirmed: false,
        loanPeriods: [],
      }),
    ).toBe("Needs instrument assignment");
  });

  it("flags reviewing-but-unconfirmed as needing confirmation", () => {
    expect(
      getRequestActionLabel({
        status: "reviewing",
        instrumentConfirmed: false,
        loanPeriods: [],
      }),
    ).toBe("Needs confirmation");
  });

  it("flags uploaded documents as needing review", () => {
    expect(
      getRequestActionLabel({
        status: "documents_uploaded",
        instrumentConfirmed: true,
        loanPeriods: [],
      }),
    ).toBe("Needs document review");
  });

  it("flags an active loan with a final addendum as needing return confirmation", () => {
    expect(
      getRequestActionLabel({
        status: "active",
        instrumentConfirmed: true,
        loanPeriods: [
          {
            periodType: "initial",
            startDate: new Date(),
            actualReturnDate: null,
            addendums: [{ timing: "final" }],
          },
        ],
      }),
    ).toBe("Needs return confirmation");
  });

  it("flags a pending extension with an initial addendum as needing extension confirmation", () => {
    expect(
      getRequestActionLabel({
        status: "active",
        instrumentConfirmed: true,
        loanPeriods: [
          {
            periodType: "extension",
            startDate: null,
            actualReturnDate: null,
            addendums: [{ timing: "initial" }],
          },
        ],
      }),
    ).toBe("Needs extension confirmation");
  });

  it("falls back to needing handover confirmation otherwise", () => {
    expect(
      getRequestActionLabel({
        status: "ready_to_pickup",
        instrumentConfirmed: true,
        loanPeriods: [],
      }),
    ).toBe("Needs handover confirmation");
  });
});
