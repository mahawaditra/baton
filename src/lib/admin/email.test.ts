import { describe, it, expect } from "vitest";
import { adminEmailSchema } from "./email";

describe("adminEmailSchema", () => {
  it("lowercases the address, because Better Auth looks users up by the lowercased email", () => {
    expect(adminEmailSchema.parse("Foo@Gmail.com")).toBe("foo@gmail.com");
  });

  it("trims the stray spaces a phone keyboard leaves behind", () => {
    expect(adminEmailSchema.parse("  foo@gmail.com ")).toBe("foo@gmail.com");
  });

  it("still rejects anything that is not an email", () => {
    const result = adminEmailSchema.safeParse("not-an-email");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });
});
