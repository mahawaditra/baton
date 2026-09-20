import { describe, it, expect } from "vitest";
import {
  AddendumTiming,
  AdminRole,
  BorrowingRequestStatus,
  DocumentReviewStatus,
  DocumentType,
  InstrumentStatus,
  ItemCondition,
} from "@/generated/prisma/enums";
import {
  ADDENDUM_TIMING_LABELS,
  CONDITION_LABELS,
  DOCUMENT_REVIEW_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  getAddendumTimingLabel,
  getConditionLabel,
  getDocumentReviewStatusLabel,
  getDocumentTypeLabel,
  getRequestStatusLabel,
  getRoleLabel,
  getStatusLabel,
} from "./labels";

const LABEL_MAPS: [string, Record<string, string>, Record<string, string>][] = [
  ["ItemCondition", ItemCondition, CONDITION_LABELS],
  ["InstrumentStatus", InstrumentStatus, STATUS_LABELS],
  ["BorrowingRequestStatus", BorrowingRequestStatus, REQUEST_STATUS_LABELS],
  ["DocumentReviewStatus", DocumentReviewStatus, DOCUMENT_REVIEW_STATUS_LABELS],
  ["AddendumTiming", AddendumTiming, ADDENDUM_TIMING_LABELS],
  ["DocumentType", DocumentType, DOCUMENT_TYPE_LABELS],
  ["AdminRole", AdminRole, ROLE_LABELS],
];

describe("label coverage", () => {
  it.each(LABEL_MAPS)(
    "gives every %s value a human label, never the raw value",
    (_name, enumObject, labels) => {
      for (const value of Object.values(enumObject)) {
        const label = labels[value];
        expect(label, `${_name}.${value} has no label`).toBeTruthy();
        expect(label).not.toBe(value);
        expect(label).not.toContain("_");
      }
    },
  );

  it.each(LABEL_MAPS)(
    "has no label for a value that is not in the %s enum",
    (_name, enumObject, labels) => {
      const known = new Set(Object.values(enumObject));
      for (const key of Object.keys(labels)) {
        expect(known.has(key), `${_name} label map has stray key ${key}`).toBe(
          true,
        );
      }
    },
  );
});

describe("request status labels", () => {
  it("uses the Indonesian labels shown on the status badge", () => {
    expect(getRequestStatusLabel("submitted")).toBe("Diajukan");
    expect(getRequestStatusLabel("ready_to_pickup")).toBe("Siap Diambil");
    expect(getRequestStatusLabel("active")).toBe("Sedang Dipinjam");
    expect(getRequestStatusLabel("returned")).toBe("Selesai");
    expect(getRequestStatusLabel("overdue")).toBe("Terlambat");
  });
});

describe("document review status labels", () => {
  it("labels each review state", () => {
    expect(getDocumentReviewStatusLabel("pending")).toBe("Menunggu");
    expect(getDocumentReviewStatusLabel("approved")).toBe("Disetujui");
    expect(getDocumentReviewStatusLabel("rejected")).toBe("Ditolak");
  });
});

describe("addendum timing labels", () => {
  it("labels initial and final condition", () => {
    expect(getAddendumTimingLabel("initial")).toBe("Kondisi Awal");
    expect(getAddendumTimingLabel("final")).toBe("Kondisi Akhir");
  });
});

describe("role labels", () => {
  it("labels each role the way it is shown in the admin list", () => {
    expect(getRoleLabel("staff")).toBe("Staff");
    expect(getRoleLabel("pengurus_inti")).toBe("Pengurus Inti");
    expect(getRoleLabel("ketua")).toBe("Ketua");
    expect(getRoleLabel("overlord")).toBe("Overlord");
  });
});

describe("label lookups", () => {
  it("fall back to the raw value for anything unknown instead of throwing", () => {
    expect(getConditionLabel("something_new")).toBe("something_new");
    expect(getStatusLabel("something_new")).toBe("something_new");
    expect(getRequestStatusLabel("something_new")).toBe("something_new");
    expect(getDocumentTypeLabel("something_new")).toBe("something_new");
    expect(getDocumentReviewStatusLabel("something_new")).toBe("something_new");
    expect(getAddendumTimingLabel("something_new")).toBe("something_new");
    expect(getRoleLabel("something_new")).toBe("something_new");
  });
});
