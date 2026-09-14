import { describe, it, expect } from "vitest";
import { generateTicketId, generateAccessCode } from "./id-generators";
import { INSTRUMENT_TYPE_CODES } from "./constants";

describe("generateTicketId", () => {
  it("generates an 8-digit numeric ID", () => {
    const id = generateTicketId("Violin");
    expect(id).toHaveLength(8);
    expect(id).toMatch(/^\d{8}$/);
  });

  it("starts with the current 2-digit year", () => {
    const yy = String(new Date().getFullYear() % 100).padStart(2, "0");
    expect(generateTicketId("Cello").slice(0, 2)).toBe(yy);
  });

  it("embeds the instrument type's assigned code", () => {
    expect(generateTicketId("Violin").slice(2, 4)).toBe(
      INSTRUMENT_TYPE_CODES.Violin,
    );
    expect(generateTicketId("Tuba").slice(2, 4)).toBe(
      INSTRUMENT_TYPE_CODES.Tuba,
    );
  });

  it("gives different instrument types different codes", () => {
    expect(generateTicketId("Violin").slice(2, 4)).not.toBe(
      generateTicketId("Viola").slice(2, 4),
    );
  });

  it("varies the last 4 digits across calls", () => {
    const suffixes = new Set(
      Array.from({ length: 20 }, () => generateTicketId("Oboe").slice(4)),
    );
    expect(suffixes.size).toBeGreaterThan(1);
  });
});

describe("generateAccessCode", () => {
  it("generates 6-character uppercase codes", () => {
    const code = generateAccessCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
    expect(code).not.toMatch(/[0O1Il]/);
  });
});
