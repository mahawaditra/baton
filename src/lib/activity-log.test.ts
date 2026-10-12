import { describe, it, expect } from "vitest";
import {
  buildAnnualSummaryRows,
  formatActivityLog,
  FORMER_MEMBER_LABEL,
  resolveActorName,
} from "./activity-log";

function log(action: string, metadata: unknown) {
  return {
    action,
    entityType: "borrowing_request",
    entityId: "irrelevant",
    metadata,
    createdAt: new Date(),
  };
}

describe("resolveActorName", () => {
  it("uses the live admin's current name while they still exist", () => {
    expect(resolveActorName({ name: "Zenka" }, null)).toBe("Zenka");
  });
  it("prefers the live name over a stale snapshot", () => {
    expect(resolveActorName({ name: "Zenka" }, "Old Name")).toBe("Zenka");
  });
  it("falls back to the saved name once the admin is gone", () => {
    expect(resolveActorName(null, "Dewa")).toBe("Dewa");
  });
  it("falls back to a neutral label when neither exists", () => {
    expect(resolveActorName(null, null)).toBe(FORMER_MEMBER_LABEL);
    expect(resolveActorName(undefined, undefined)).toBe(FORMER_MEMBER_LABEL);
  });
});

describe("buildAnnualSummaryRows", () => {
  const rows = buildAnnualSummaryRows({
    year: 2026,
    periodEnd: new Date("2026-09-20T00:00:00Z"),
    activeLoans: 12,
    requestsThisYear: 20,
    statusBreakdown: [
      { status: "ready_to_pickup", _count: 3 },
      { status: "returned", _count: 9 },
    ],
    revitalizedCount: 2,
  });

  it("labels each request status in the breakdown instead of printing the enum", () => {
    expect(rows).toContainEqual({ Metric: "  Status: Siap Diambil", Value: 3 });
    expect(rows).toContainEqual({ Metric: "  Status: Selesai", Value: 9 });
  });

  it("labels the repaired-instruments metric with condition names", () => {
    expect(rows).toContainEqual({
      Metric: "Instruments Repaired (Perlu revitalisasi → Baik)",
      Value: 2,
    });
  });

  it("never leaks a raw enum value into any metric name", () => {
    for (const row of rows) {
      expect(row.Metric).not.toMatch(/ready_to_pickup|need_repair|returned/);
    }
  });

  it("keeps the counts intact", () => {
    expect(rows[0]).toEqual({ Metric: "Active Loans", Value: 12 });
    expect(rows[1].Value).toBe(20);
  });
});

describe("formatActivityLog", () => {
  it("lists only the fields that actually changed on update_instrument", () => {
    const before = { condition: "need_repair", status: "available", location: "Sekre" };
    const after = { condition: "ok", status: "available", location: "Sekre" };
    expect(formatActivityLog(log("update_instrument", { before, after }))).toBe(
      "updated instrument (condition: Perlu revitalisasi → Baik)",
    );
  });

  it("shows labels, not enum values, for condition and status on update_instrument", () => {
    const before = { condition: "need_repair", status: "available", location: "Sekre" };
    const after = { condition: "retired", status: "unavailable", location: "Sekre" };
    const message = formatActivityLog(log("update_instrument", { before, after }));
    expect(message).toBe(
      "updated instrument (condition: Perlu revitalisasi → Pensiun, status: Tersedia → Nonaktif)",
    );
    expect(message).not.toMatch(/need_repair|retired|unavailable|available/);
  });

  it("keeps location as typed on update_instrument", () => {
    const before = { condition: "ok", status: "available", location: "Sekre" };
    const after = { condition: "ok", status: "available", location: "RB1 & Sekre" };
    expect(formatActivityLog(log("update_instrument", { before, after }))).toBe(
      "updated instrument (location: Sekre → RB1 & Sekre)",
    );
  });

  it("shows the condition label on update_goods but leaves quantity as a number", () => {
    const before = { condition: "ok", quantity: 2, location: "RB1" };
    const after = { condition: "lost", quantity: 1, location: "RB1" };
    expect(formatActivityLog(log("update_goods", { before, after }))).toBe(
      "updated goods (condition: Baik → Hilang, quantity: 2 → 1)",
    );
  });

  it("shows the condition label on confirm_return", () => {
    expect(
      formatActivityLog(
        log("confirm_return", {
          condition: "need_repair",
          status: "available",
          depositRefundAmount: 0,
          daysLate: 0,
        }),
      ),
    ).toBe("confirmed return (condition: Perlu revitalisasi, refund: Rp0)");
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
    ).toBe("approved Scan KTP");
  });

  it("falls back to the raw type for a document type it has no label for", () => {
    expect(
      formatActivityLog(
        log("approve_documents", { documentId: "d1", type: "some_new_type", notes: null }),
      ),
    ).toBe("approved some_new_type");
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
    ).toBe("rejected Bukti Transfer Deposit: Nominal tidak sesuai");
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

  it("names only the changed fields on update_loan_settings, never their values", () => {
    const before = {
      signatoryName: "Ahmad Jutrzenka Ilyas",
      signatoryPhone: "085173439808",
      signatoryKtpNumber: "3174102311010002",
      signatoryAddressKtp: "Jl. Garuda III D3 No. 1",
      bankName: "BCA",
      dueDate: new Date("2027-08-29"),
      signatoryImageDriveId: "old-image",
    };
    const after = {
      ...before,
      signatoryName: "Hannan Abiyyu Arkan",
      signatoryKtpNumber: "3171081509050001",
      signatoryAddressKtp: "Jl. Kramat Jaya No. 92",
      dueDate: new Date("2027-09-20"),
      signatoryImageDriveId: "new-image",
    };
    const message = formatActivityLog(
      log("update_loan_settings", { before, after }),
    );
    expect(message).toBe(
      "updated loan settings (signatoryName, signatoryAddressKtp, signatoryKtpNumber, dueDate, signatureImage)",
    );
    expect(message).not.toContain("→");
    expect(message).not.toContain("3171081509050001");
  });

  it("falls back to a plain message on update_loan_settings when nothing tracked changed", () => {
    const same = {
      signatoryName: "Hannan Abiyyu Arkan",
      dueDate: new Date("2027-09-20"),
      signatoryImageDriveId: "image",
    };
    expect(
      formatActivityLog(log("update_loan_settings", { before: same, after: same })),
    ).toBe("updated loan settings");
  });

  it("describes a handover with the new Ketua and how many staff were removed", () => {
    expect(
      formatActivityLog(
        log("handover_ketua", {
          newKetua: { name: "Rani", email: "rani@example.com" },
          deletedStaff: ["Dewa", "Hafizh", "Aca"],
        }),
      ),
    ).toBe(
      "handed over the Ketua position to Rani (rani@example.com) and removed 3 staff",
    );
  });

  it("describes the final step of a handover", () => {
    expect(formatActivityLog(log("complete_handover", null))).toBe(
      "completed the handover and left BATON",
    );
  });

  it("names the role when a new admin was added with one", () => {
    expect(
      formatActivityLog(
        log("add_admin", {
          name: "Rani",
          email: "rani@example.com",
          role: "ketua",
        }),
      ),
    ).toBe("added a new Ketua (Rani, rani@example.com)");
    expect(
      formatActivityLog(
        log("add_admin", { name: "Old", email: "old@example.com" }),
      ),
    ).toBe("added a new admin (Old, old@example.com)");
  });

  it("falls back to a humanized action name for actions with no dedicated message", () => {
    expect(formatActivityLog(log("some_future_action", null))).toBe(
      "some future action",
    );
  });
});
