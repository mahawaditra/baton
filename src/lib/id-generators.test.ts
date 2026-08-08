import { describe, it, expect } from "vitest";
import { generateTicketId, generateAccessCode } from "./id-generators";

describe("generateTicketId", () => {
  it("generates 7-character IDs with no ambiguous characters (0/O/1/I/l)", () => {
    const id = generateTicketId();
    expect(id).toHaveLength(7);
    expect(id).not.toMatch(/[0O1Il]/);
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
