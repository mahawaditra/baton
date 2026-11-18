import { describe, expect, it } from "vitest";
import { z } from "zod";
import { hasFieldErrors, validationErrors } from "./form-errors";

const schema = z
  .object({
    name: z.string().trim().min(1, "Nama wajib diisi"),
    year: z.string().regex(/^\d{4}$/, "Angkatan harus 4 digit angka"),
  })
  .refine((data) => data.name !== "x", "Form-level problem");

describe("validationErrors", () => {
  it("keeps the first message per field", () => {
    const result = schema.safeParse({ name: "", year: "23" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(validationErrors(result.error)).toEqual({
      error: null,
      fieldErrors: {
        name: "Nama wajib diisi",
        year: "Angkatan harus 4 digit angka",
      },
    });
  });

  it("returns form-level issues as error", () => {
    const result = schema.safeParse({ name: "x", year: "2023" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(validationErrors(result.error)).toEqual({
      error: "Form-level problem",
      fieldErrors: {},
    });
  });
});

describe("hasFieldErrors", () => {
  it("ignores empty entries", () => {
    expect(hasFieldErrors({})).toBe(false);
    expect(hasFieldErrors({ name: undefined })).toBe(false);
    expect(hasFieldErrors({ name: "Nama wajib diisi" })).toBe(true);
  });
});
