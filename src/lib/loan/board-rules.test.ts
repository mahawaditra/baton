import { describe, it, expect } from "vitest";
import {
  compareBoardRequests,
  getBoardChip,
  getBoardColumn,
  getDocumentApprovalProgress,
} from "./board-rules";

describe("getBoardColumn", () => {
  const base = { instrumentConfirmed: false, carriedOverAt: null };

  it("keeps submitted requests in the first column", () => {
    expect(getBoardColumn({ ...base, status: "submitted" })).toBe("requested");
  });

  it("keeps an assigned-but-unconfirmed request in the first column", () => {
    expect(
      getBoardColumn({ ...base, status: "reviewing", instrumentConfirmed: false }),
    ).toBe("requested");
  });

  it("moves to in_review once the borrower has been notified", () => {
    expect(
      getBoardColumn({ ...base, status: "reviewing", instrumentConfirmed: true }),
    ).toBe("in_review");
  });

  it("keeps contract_generated in in_review, including after a document rejection", () => {
    expect(getBoardColumn({ ...base, status: "contract_generated" })).toBe(
      "in_review",
    );
  });

  it("maps documents_uploaded to document_review", () => {
    expect(getBoardColumn({ ...base, status: "documents_uploaded" })).toBe(
      "document_review",
    );
  });

  it("maps ready_to_pickup to handover", () => {
    expect(getBoardColumn({ ...base, status: "ready_to_pickup" })).toBe(
      "handover",
    );
  });

  it("keeps active and overdue loans in on_loan when not carried over", () => {
    expect(getBoardColumn({ ...base, status: "active" })).toBe("on_loan");
    expect(getBoardColumn({ ...base, status: "overdue" })).toBe("on_loan");
  });

  it("moves carried-over active and overdue loans to ongoing", () => {
    const carriedOverAt = new Date("2026-09-08T00:00:00Z");
    expect(getBoardColumn({ ...base, status: "active", carriedOverAt })).toBe(
      "ongoing",
    );
    expect(getBoardColumn({ ...base, status: "overdue", carriedOverAt })).toBe(
      "ongoing",
    );
  });

  it("returns null for closed requests", () => {
    expect(getBoardColumn({ ...base, status: "rejected" })).toBeNull();
    expect(getBoardColumn({ ...base, status: "cancelled" })).toBeNull();
    expect(getBoardColumn({ ...base, status: "returned" })).toBeNull();
  });
});

describe("getBoardChip", () => {
  const today = new Date("2026-10-12T00:00:00Z");

  function build(
    status: string,
    options: {
      instrumentConfirmed?: boolean;
      dueDate?: string;
      periodType?: string;
      startDate?: Date | null;
      actualReturnDate?: Date | null;
      documents?: { reviewStatus: string }[];
      addendums?: { timing: string }[];
    } = {},
  ) {
    return {
      status,
      instrumentConfirmed: options.instrumentConfirmed ?? false,
      loanPeriods: [
        {
          periodType: options.periodType ?? "initial",
          startDate:
            options.startDate === undefined
              ? new Date("2026-09-01T00:00:00Z")
              : options.startDate,
          dueDate: new Date(`${options.dueDate ?? "2026-10-24"}T00:00:00Z`),
          actualReturnDate: options.actualReturnDate ?? null,
          documents: options.documents ?? [],
          addendums: options.addendums ?? [],
        },
      ],
    };
  }

  it("flags submitted and unconfirmed reviewing as admin actions", () => {
    expect(getBoardChip(build("submitted"), today)).toEqual({
      tone: "action",
      label: "Needs instrument assignment",
    });
    expect(getBoardChip(build("reviewing"), today)).toEqual({
      tone: "action",
      label: "Needs confirmation",
    });
  });

  it("waits on the borrower once the instrument is confirmed", () => {
    expect(
      getBoardChip(build("reviewing", { instrumentConfirmed: true }), today),
    ).toEqual({
      tone: "waiting",
      label: "Waiting for borrower to fill in contract details",
    });
  });

  it("waits for documents after the contract is generated", () => {
    expect(getBoardChip(build("contract_generated"), today)).toEqual({
      tone: "waiting",
      label: "Waiting for borrower to upload documents",
    });
  });

  it("calls out a rejected document while waiting for re-upload", () => {
    const chip = getBoardChip(
      build("contract_generated", {
        documents: [
          { reviewStatus: "approved" },
          { reviewStatus: "approved" },
          { reviewStatus: "rejected" },
        ],
      }),
      today,
    );
    expect(chip).toEqual({
      tone: "waiting",
      label: "Document rejected, waiting for re-upload",
    });
  });

  it("flags documents_uploaded as a review action", () => {
    expect(getBoardChip(build("documents_uploaded"), today)).toEqual({
      tone: "action",
      label: "Needs document review",
    });
  });

  it("waits for pickup until the initial addendum is filled", () => {
    expect(getBoardChip(build("ready_to_pickup"), today)).toEqual({
      tone: "waiting",
      label: "Waiting for pickup",
    });
    expect(
      getBoardChip(
        build("ready_to_pickup", { addendums: [{ timing: "initial" }] }),
        today,
      ),
    ).toEqual({ tone: "action", label: "Needs handover confirmation" });
  });

  it("shows a countdown for active loans", () => {
    expect(getBoardChip(build("active"), today)).toEqual({
      tone: "ok",
      label: "12 days left",
    });
    expect(
      getBoardChip(build("active", { dueDate: "2026-10-13" }), today),
    ).toEqual({ tone: "ok", label: "1 day left" });
    expect(
      getBoardChip(build("active", { dueDate: "2026-10-12" }), today),
    ).toEqual({ tone: "ok", label: "Due today" });
  });

  it("shows overdue even when the cron has not flipped the status yet", () => {
    expect(
      getBoardChip(build("active", { dueDate: "2026-10-10" }), today),
    ).toEqual({ tone: "late", label: "Overdue 2 days" });
    expect(
      getBoardChip(build("overdue", { dueDate: "2026-10-07" }), today),
    ).toEqual({ tone: "late", label: "Overdue 5 days" });
  });

  it("prefers a pending return over the countdown, even when overdue", () => {
    const options = { addendums: [{ timing: "final" }] };
    expect(getBoardChip(build("active", options), today)).toEqual({
      tone: "action",
      label: "Needs return confirmation",
    });
    expect(
      getBoardChip(
        build("overdue", { ...options, dueDate: "2026-10-07" }),
        today,
      ),
    ).toEqual({ tone: "action", label: "Needs return confirmation" });
  });

  it("prefers a pending extension over the countdown", () => {
    expect(
      getBoardChip(
        build("active", { periodType: "extension", startDate: null }),
        today,
      ),
    ).toEqual({ tone: "action", label: "Needs extension confirmation" });
  });

  it("returns null for closed requests", () => {
    expect(getBoardChip(build("rejected"), today)).toBeNull();
    expect(getBoardChip(build("cancelled"), today)).toBeNull();
    expect(getBoardChip(build("returned"), today)).toBeNull();
  });
});

describe("compareBoardRequests", () => {
  const today = new Date("2026-10-12T00:00:00Z");

  function row(
    status: string,
    options: {
      createdAt?: string;
      dueDate?: string;
      instrumentConfirmed?: boolean;
      addendums?: { timing: string }[];
    } = {},
  ) {
    return {
      status,
      instrumentConfirmed: options.instrumentConfirmed ?? false,
      createdAt: new Date(`${options.createdAt ?? "2026-09-01"}T00:00:00Z`),
      loanPeriods: [
        {
          periodType: "initial",
          startDate: new Date("2026-09-01T00:00:00Z"),
          dueDate: new Date(`${options.dueDate ?? "2026-10-24"}T00:00:00Z`),
          actualReturnDate: null,
          documents: [],
          addendums: options.addendums ?? [],
        },
      ],
    };
  }

  function sortRows(rows: ReturnType<typeof row>[]) {
    return [...rows].sort((a, b) => compareBoardRequests(a, b, today));
  }

  it("puts overdue loans before pending actions and healthy loans", () => {
    const healthy = row("active", { dueDate: "2026-10-30" });
    const pendingReturn = row("active", {
      dueDate: "2026-11-30",
      addendums: [{ timing: "final" }],
    });
    const late = row("overdue", { dueDate: "2026-10-05" });

    expect(sortRows([healthy, pendingReturn, late])).toEqual([
      late,
      pendingReturn,
      healthy,
    ]);
  });

  it("orders loans of the same tone by submission date, oldest first by default", () => {
    const newer = row("active", { createdAt: "2026-09-20" });
    const older = row("active", { createdAt: "2026-09-02" });

    expect(sortRows([newer, older])).toEqual([older, newer]);
  });

  it("flips the date order within a tone when sorting newest first", () => {
    const newer = row("active", { createdAt: "2026-09-20" });
    const older = row("active", { createdAt: "2026-09-02" });

    const sorted = [older, newer].sort((a, b) =>
      compareBoardRequests(a, b, today, "newest"),
    );
    expect(sorted).toEqual([newer, older]);
  });

  it("keeps overdue and action rows on top even when sorting newest first", () => {
    const healthyNew = row("active", { createdAt: "2026-10-01" });
    const lateOld = row("overdue", {
      createdAt: "2026-09-01",
      dueDate: "2026-10-05",
    });

    const sorted = [healthyNew, lateOld].sort((a, b) =>
      compareBoardRequests(a, b, today, "newest"),
    );
    expect(sorted).toEqual([lateOld, healthyNew]);
  });

  it("puts admin actions before waiting rows in queue columns", () => {
    const waiting = row("ready_to_pickup", { createdAt: "2026-09-01" });
    const needsHandover = row("ready_to_pickup", {
      createdAt: "2026-09-20",
      addendums: [{ timing: "initial" }],
    });

    expect(sortRows([waiting, needsHandover])).toEqual([
      needsHandover,
      waiting,
    ]);
  });

  it("orders queue rows of the same tone oldest first", () => {
    const newer = row("submitted", { createdAt: "2026-10-10" });
    const older = row("submitted", { createdAt: "2026-10-01" });

    expect(sortRows([newer, older])).toEqual([older, newer]);
  });
});

describe("getDocumentApprovalProgress", () => {
  it("starts at 0/3 when documents are waiting for review", () => {
    expect(
      getDocumentApprovalProgress({
        status: "documents_uploaded",
        loanPeriods: [
          {
            documents: [
              { reviewStatus: "pending" },
              { reviewStatus: "pending" },
              { reviewStatus: "pending" },
            ],
          },
        ],
      }),
    ).toEqual({ approved: 0, total: 3 });
  });

  it("counts already-approved documents during a re-review", () => {
    expect(
      getDocumentApprovalProgress({
        status: "documents_uploaded",
        loanPeriods: [
          {
            documents: [
              { reviewStatus: "approved" },
              { reviewStatus: "approved" },
              { reviewStatus: "pending" },
            ],
          },
        ],
      }),
    ).toEqual({ approved: 2, total: 3 });
  });

  it("shows progress while waiting for a re-upload after a rejection", () => {
    expect(
      getDocumentApprovalProgress({
        status: "contract_generated",
        loanPeriods: [
          {
            documents: [
              { reviewStatus: "approved" },
              { reviewStatus: "approved" },
              { reviewStatus: "rejected" },
            ],
          },
        ],
      }),
    ).toEqual({ approved: 2, total: 3 });
  });

  it("hides progress on the first pass before anything was rejected", () => {
    expect(
      getDocumentApprovalProgress({
        status: "contract_generated",
        loanPeriods: [{ documents: [{ reviewStatus: "pending" }] }],
      }),
    ).toBeNull();
  });

  it("hides progress outside the document stages", () => {
    expect(
      getDocumentApprovalProgress({
        status: "active",
        loanPeriods: [{ documents: [{ reviewStatus: "approved" }] }],
      }),
    ).toBeNull();
  });
});
