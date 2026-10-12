import { describe, it, expect } from "vitest";
import { hideContactUnlessHandover } from "./request-row";

describe("hideContactUnlessHandover", () => {
  const base = { borrowerPhone: "0812", borrowerLineId: "line.id" };

  it("keeps contact details for requests ready to pick up", () => {
    const row = { ...base, status: "ready_to_pickup" as const };
    expect(hideContactUnlessHandover(row)).toBe(row);
  });

  it("blanks contact details for every other status", () => {
    const row = { ...base, status: "reviewing" as const };
    expect(hideContactUnlessHandover(row)).toEqual({
      status: "reviewing",
      borrowerPhone: "",
      borrowerLineId: "",
    });
  });
});
