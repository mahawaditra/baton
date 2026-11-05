import { describe, it, expect } from "vitest";
import {
  calculateDepositRefund,
  determineInstrumentStatusOnReturn,
  isOutOfServiceCondition,
  documentTypesNeedingUpload,
  canAssignInstrument,
  canNotifyBorrower,
  canCancelRequest,
  computeCanExtend,
  confirmedExtensionCount,
  requiredDocumentTypesForPeriod,
  getRequestActionLabel,
  getRequestStep,
  getStatusTurn,
  displayedDueDate,
  waitingOnBorrowerLabel,
  getDocumentTypeLabel,
  hasAvailableSlot,
  formatSharedLocation,
  resolveMaxConcurrentLoans,
  resolveNickname,
  formatNameWithNickname,
} from "./loan-rules";
import { todayInJakarta } from "@/lib/format";

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

describe("isOutOfServiceCondition", () => {
  it("is true only for retired and lost", () => {
    expect(isOutOfServiceCondition("retired")).toBe(true);
    expect(isOutOfServiceCondition("lost")).toBe(true);
    expect(isOutOfServiceCondition("ok")).toBe(false);
    expect(isOutOfServiceCondition("need_repair")).toBe(false);
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

describe("waitingOnBorrowerLabel", () => {
  it("uses plain wording instead of the internal Stage 2 term", () => {
    expect(waitingOnBorrowerLabel("reviewing")).toBe(
      "Waiting for borrower to fill in contract details",
    );
    expect(waitingOnBorrowerLabel("contract_generated")).toBe(
      "Waiting for borrower to upload documents",
    );
    expect(waitingOnBorrowerLabel("ready_to_pickup")).toBe("Waiting for pickup");
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

describe("getRequestStep", () => {
  it("treats rejected, overdue, and cancelled as exceptions regardless of instrumentConfirmed", () => {
    expect(getRequestStep("rejected", false)).toBe("exception");
    expect(getRequestStep("overdue", true)).toBe("exception");
    expect(getRequestStep("cancelled", false)).toBe("exception");
  });

  it("puts submitted at step 1", () => {
    expect(getRequestStep("submitted", false)).toBe(1);
  });

  it("splits reviewing between step 1 and step 2 based on instrumentConfirmed", () => {
    expect(getRequestStep("reviewing", false)).toBe(1);
    expect(getRequestStep("reviewing", true)).toBe(2);
  });

  it("puts contract_generated and documents_uploaded at step 2", () => {
    expect(getRequestStep("contract_generated", true)).toBe(2);
    expect(getRequestStep("documents_uploaded", true)).toBe(2);
  });

  it("puts ready_to_pickup at step 3", () => {
    expect(getRequestStep("ready_to_pickup", true)).toBe(3);
  });

  it("puts active and returned at step 4", () => {
    expect(getRequestStep("active", true)).toBe(4);
    expect(getRequestStep("returned", true)).toBe(4);
  });

  it("falls back to step 1 for an unrecognized status", () => {
    expect(getRequestStep("something_unexpected", false)).toBe(1);
  });
});

describe("canCancelRequest", () => {
  it("allows cancelling before the borrower has taken the instrument", () => {
    expect(canCancelRequest("submitted")).toBe(true);
    expect(canCancelRequest("reviewing")).toBe(true);
    expect(canCancelRequest("contract_generated")).toBe(true);
    expect(canCancelRequest("documents_uploaded")).toBe(true);
    expect(canCancelRequest("ready_to_pickup")).toBe(true);
  });

  it("blocks cancelling once the loan is active or already resolved", () => {
    expect(canCancelRequest("active")).toBe(false);
    expect(canCancelRequest("overdue")).toBe(false);
    expect(canCancelRequest("returned")).toBe(false);
    expect(canCancelRequest("rejected")).toBe(false);
    expect(canCancelRequest("cancelled")).toBe(false);
  });
});

describe("getDocumentTypeLabel", () => {
  it("returns the human-readable label for known document types", () => {
    expect(getDocumentTypeLabel("signed_contract")).toBe(
      "Kontrak yang Ditandatangani",
    );
    expect(getDocumentTypeLabel("deposit_proof")).toBe(
      "Bukti Transfer Deposit",
    );
    expect(getDocumentTypeLabel("ktp_scan")).toBe("Scan KTP");
  });

  it("falls back to the raw type for an unknown document type", () => {
    expect(getDocumentTypeLabel("some_new_type")).toBe("some_new_type");
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

describe("confirmedExtensionCount", () => {
  it("returns 0 for a loan with no periods", () => {
    expect(confirmedExtensionCount(null)).toBe(0);
    expect(confirmedExtensionCount(undefined)).toBe(0);
  });

  it("returns 0 for a loan still on its initial period", () => {
    expect(confirmedExtensionCount({ sequence: 1, startDate: new Date() })).toBe(
      0,
    );
  });

  it("counts confirmed extensions when the latest period has started", () => {
    expect(confirmedExtensionCount({ sequence: 2, startDate: new Date() })).toBe(
      1,
    );
    expect(confirmedExtensionCount({ sequence: 3, startDate: new Date() })).toBe(
      2,
    );
  });

  it("does not count a pending extension that has not been confirmed yet", () => {
    expect(confirmedExtensionCount({ sequence: 2, startDate: null })).toBe(0);
    expect(confirmedExtensionCount({ sequence: 3, startDate: null })).toBe(1);
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

describe("hasAvailableSlot", () => {
  it("has room when active count is below the max", () => {
    expect(hasAvailableSlot(1, 2)).toBe(true);
  });

  it("has no room once active count reaches the max", () => {
    expect(hasAvailableSlot(2, 2)).toBe(false);
  });

  it("has no room for the default single-slot instrument", () => {
    expect(hasAvailableSlot(1, 1)).toBe(false);
  });
});

describe("formatSharedLocation", () => {
  it("falls back to the stored location when nobody holds it", () => {
    expect(formatSharedLocation([], "Sekre")).toBe("Sekre");
  });

  it("shows a single holder's name and year", () => {
    expect(
      formatSharedLocation(
        [{ borrowerName: "Adit", borrowerNickname: null, borrowerYear: "2020" }],
        "Sekre",
      ),
    ).toBe("Adit (2020)");
  });

  it("joins multiple concurrent holders with '&'", () => {
    expect(
      formatSharedLocation(
        [
          { borrowerName: "Adit", borrowerNickname: null, borrowerYear: "2020" },
          { borrowerName: "David", borrowerNickname: null, borrowerYear: "2022" },
        ],
        "Sekre",
      ),
    ).toBe("Adit (2020) & David (2022)");
  });

  it("uses each holder's nickname when present", () => {
    expect(
      formatSharedLocation(
        [
          {
            borrowerName: "Salsabila Putri Alisa",
            borrowerNickname: "Aca",
            borrowerYear: "2024",
          },
          { borrowerName: "David", borrowerNickname: null, borrowerYear: "2022" },
        ],
        "Sekre",
      ),
    ).toBe("Aca (2024) & David (2022)");
  });
});

describe("resolveNickname", () => {
  it("uses the nickname when present", () => {
    expect(resolveNickname("Salsabila Putri Alisa", "Aca")).toBe("Aca");
  });

  it("falls back to the full name when nickname is null", () => {
    expect(resolveNickname("Salsabila Putri Alisa", null)).toBe(
      "Salsabila Putri Alisa",
    );
  });

  it("falls back to the full name when nickname is blank", () => {
    expect(resolveNickname("Salsabila Putri Alisa", "   ")).toBe(
      "Salsabila Putri Alisa",
    );
  });
});

describe("formatNameWithNickname", () => {
  it("combines full name and nickname when both present", () => {
    expect(formatNameWithNickname("Salsabila Putri Alisa", "Aca")).toBe(
      "Salsabila Putri Alisa (Aca)",
    );
  });

  it("shows only the full name when nickname is null", () => {
    expect(formatNameWithNickname("Salsabila Putri Alisa", null)).toBe(
      "Salsabila Putri Alisa",
    );
  });

  it("shows only the full name when nickname is blank", () => {
    expect(formatNameWithNickname("Salsabila Putri Alisa", "   ")).toBe(
      "Salsabila Putri Alisa",
    );
  });
});

describe("resolveMaxConcurrentLoans", () => {
  const slots = [
    { instrumentType: "French Horn", maxConcurrentLoans: 2 },
    { instrumentType: "Contrabass", maxConcurrentLoans: 3 },
  ];

  it("matches an instrument type identical to the canonical name", () => {
    expect(resolveMaxConcurrentLoans("French Horn", slots)).toBe(2);
  });

  it("matches a variant that contains the canonical name (regression: Double/Single French Horn)", () => {
    expect(resolveMaxConcurrentLoans("Double French Horn", slots)).toBe(2);
    expect(resolveMaxConcurrentLoans("Single French Horn", slots)).toBe(2);
  });

  it("matches case-insensitively", () => {
    expect(resolveMaxConcurrentLoans("double french horn", slots)).toBe(2);
  });

  it("falls back to 1 when no configured type matches", () => {
    expect(resolveMaxConcurrentLoans("Triangle", slots)).toBe(1);
  });
});

describe("getStatusTurn", () => {
  const base: Parameters<typeof getStatusTurn>[0] = {
    status: "submitted",
    instrumentConfirmed: false,
    hasInitialAddendum: false,
    hasFinalAddendum: false,
    isExtensionPeriod: false,
    needsExtensionDocuments: false,
    canFillExtensionAddendum: false,
    hasPendingExtension: false,
  };

  it("waits on staff while the request is being checked", () => {
    expect(getStatusTurn(base)?.actor).toBe("staff");
    expect(getStatusTurn({ ...base, status: "reviewing" })?.actor).toBe(
      "staff",
    );
  });

  it("hands over to the borrower once the instrument is confirmed", () => {
    expect(
      getStatusTurn({ ...base, status: "reviewing", instrumentConfirmed: true })
        ?.actor,
    ).toBe("borrower");
  });

  it("asks the borrower to sign and upload after the contract is generated", () => {
    expect(
      getStatusTurn({ ...base, status: "contract_generated" })?.actor,
    ).toBe("borrower");
  });

  it("waits on staff while documents are reviewed", () => {
    expect(
      getStatusTurn({ ...base, status: "documents_uploaded" })?.actor,
    ).toBe("staff");
  });

  it("splits pickup by whether the initial addendum is in", () => {
    expect(getStatusTurn({ ...base, status: "ready_to_pickup" })?.actor).toBe(
      "borrower",
    );
    expect(
      getStatusTurn({
        ...base,
        status: "ready_to_pickup",
        hasInitialAddendum: true,
      })?.actor,
    ).toBe("staff");
  });

  it("waits on staff after the return addendum is sent", () => {
    expect(
      getStatusTurn({ ...base, status: "active", hasFinalAddendum: true })
        ?.actor,
    ).toBe("staff");
    expect(
      getStatusTurn({ ...base, status: "overdue", hasFinalAddendum: true })
        ?.actor,
    ).toBe("staff");
  });

  it("follows the extension flow", () => {
    const extension: typeof base = {
      ...base,
      status: "active",
      isExtensionPeriod: true,
    };
    expect(
      getStatusTurn({ ...extension, needsExtensionDocuments: true })?.actor,
    ).toBe("borrower");
    expect(getStatusTurn(extension)?.actor).toBe("staff");
    expect(
      getStatusTurn({ ...extension, canFillExtensionAddendum: true })?.actor,
    ).toBe("borrower");
    expect(
      getStatusTurn({
        ...extension,
        hasInitialAddendum: true,
        hasPendingExtension: true,
      }),
    ).toEqual({
      actor: "staff",
      message:
        "Addendum perpanjangan kamu udah terkirim. Tinggal nunggu konfirmasi staf.",
    });
    expect(
      getStatusTurn({ ...extension, hasInitialAddendum: true }),
    ).toBeNull();
  });

  it("has no turn while the loan just runs or after it ends", () => {
    expect(getStatusTurn({ ...base, status: "active" })).toBeNull();
    expect(getStatusTurn({ ...base, status: "returned" })).toBeNull();
    expect(getStatusTurn({ ...base, status: "rejected" })).toBeNull();
    expect(getStatusTurn({ ...base, status: "cancelled" })).toBeNull();
  });
});

describe("displayedDueDate", () => {
  const initialDue = new Date("2026-11-16T00:00:00Z");
  const extensionDue = new Date("2027-09-20T00:00:00Z");

  it("shows the latest period's due date for a normal loan", () => {
    expect(
      displayedDueDate(
        { dueDate: initialDue, startDate: new Date(), periodType: "initial" },
        null,
      ),
    ).toEqual(initialDue);
  });

  it("keeps the previous due date while an extension awaits staff", () => {
    expect(
      displayedDueDate(
        { dueDate: extensionDue, startDate: null, periodType: "extension" },
        { dueDate: initialDue },
      ),
    ).toEqual(initialDue);
  });

  it("switches to the extension due date once staff confirms it", () => {
    expect(
      displayedDueDate(
        {
          dueDate: extensionDue,
          startDate: new Date(),
          periodType: "extension",
        },
        { dueDate: initialDue },
      ),
    ).toEqual(extensionDue);
  });

  it("returns null when there is no loan period yet", () => {
    expect(displayedDueDate(null, null)).toBeNull();
  });
});
