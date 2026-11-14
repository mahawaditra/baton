import { describe, it, expect } from "vitest";
import { ADMIN_NAME_MAX_LENGTH, handoverSchema } from "./admin-schemas";

describe("handoverSchema", () => {
  it("accepts a valid email and name, normalized the same way the server stores them", () => {
    expect(
      handoverSchema.parse({ email: " Foo@Gmail.com ", name: "  Adit  " }),
    ).toEqual({ email: "foo@gmail.com", name: "Adit" });
  });

  it("rejects a name that is only spaces, so the Handover button stays disabled", () => {
    const result = handoverSchema.safeParse({
      email: "foo@gmail.com",
      name: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than the input's maxLength", () => {
    const result = handoverSchema.safeParse({
      email: "foo@gmail.com",
      name: "a".repeat(ADMIN_NAME_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("ignores the role field, which only the add-admin form sends", () => {
    expect(
      handoverSchema.parse({
        email: "foo@gmail.com",
        name: "Adit",
        role: "staff",
      }),
    ).toEqual({ email: "foo@gmail.com", name: "Adit" });
  });
});
