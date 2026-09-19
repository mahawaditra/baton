import { describe, it, expect } from "vitest";
import {
  CONDITION_OPTIONS,
  STATUS_OPTIONS,
  getConditionLabel,
  getStatusLabel,
} from "./StatusBadge";

describe("getConditionLabel", () => {
  it("uses Indonesian labels, with need_repair as Perlu revitalisasi", () => {
    expect(getConditionLabel("ok")).toBe("Baik");
    expect(getConditionLabel("need_repair")).toBe("Perlu revitalisasi");
    expect(getConditionLabel("retired")).toBe("Pensiun");
    expect(getConditionLabel("lost")).toBe("Hilang");
  });
});

describe("getStatusLabel", () => {
  it("uses Indonesian labels for every instrument status", () => {
    expect(getStatusLabel("available")).toBe("Tersedia");
    expect(getStatusLabel("reserved")).toBe("Dibooking");
    expect(getStatusLabel("borrowed")).toBe("Dipinjam");
    expect(getStatusLabel("placed")).toBe("Ditempatkan");
    expect(getStatusLabel("unavailable")).toBe("Nonaktif");
  });
});

describe("select options", () => {
  it("lists every condition in dropdown order with the same labels shown elsewhere", () => {
    expect(CONDITION_OPTIONS.map((o) => o.value)).toEqual([
      "ok",
      "need_repair",
      "retired",
      "lost",
    ]);
    for (const option of CONDITION_OPTIONS) {
      expect(option.label).toBe(getConditionLabel(option.value));
    }
  });

  it("lists every status in dropdown order with the same labels shown elsewhere", () => {
    expect(STATUS_OPTIONS.map((o) => o.value)).toEqual([
      "available",
      "reserved",
      "borrowed",
      "placed",
      "unavailable",
    ]);
    for (const option of STATUS_OPTIONS) {
      expect(option.label).toBe(getStatusLabel(option.value));
    }
  });

  it("never exposes a raw enum value as a label", () => {
    for (const option of [...CONDITION_OPTIONS, ...STATUS_OPTIONS]) {
      expect(option.label).not.toContain("_");
      expect(option.label[0]).toBe(option.label[0].toUpperCase());
    }
  });
});
