import { describe, it, expect } from "vitest";
import {
  UPLOAD_NETWORK_ERROR,
  uploadSequentially,
  type UploadOutcome,
} from "./sequential-upload";

const OK: UploadOutcome = { success: true, error: null, generalError: null };

function fileOf(name: string) {
  return new File(["x"], name, { type: "image/jpeg" });
}

function items(...keys: string[]) {
  return keys.map((key) => ({ key, file: fileOf(`${key}.jpg`) }));
}

describe("uploadSequentially", () => {
  it("uploads in the given order and never runs two uploads at once", async () => {
    const order: string[] = [];
    let active = 0;
    let maxActive = 0;

    const result = await uploadSequentially(
      items("contract", "deposit", "ktp"),
      async (key) => {
        active++;
        maxActive = Math.max(maxActive, active);
        order.push(key);
        await new Promise((resolve) => setTimeout(resolve, 5));
        active--;
        return OK;
      },
    );

    expect(order).toEqual(["contract", "deposit", "ktp"]);
    expect(maxActive).toBe(1);
    expect(result.succeeded).toEqual(["contract", "deposit", "ktp"]);
    expect(result.errors).toEqual({});
    expect(result.generalError).toBeNull();
  });

  it("passes each key with its own file", async () => {
    const seen: [string, string][] = [];
    await uploadSequentially(items("a", "b"), async (key, file) => {
      seen.push([key, file.name]);
      return OK;
    });
    expect(seen).toEqual([
      ["a", "a.jpg"],
      ["b", "b.jpg"],
    ]);
  });

  it("keeps going after a per-file error and records it against that file only", async () => {
    const result = await uploadSequentially(
      items("contract", "deposit", "ktp"),
      async (key) =>
        key === "deposit"
          ? { success: false, error: "File terlalu besar.", generalError: null }
          : OK,
    );

    expect(result.succeeded).toEqual(["contract", "ktp"]);
    expect(result.errors).toEqual({ deposit: "File terlalu besar." });
    expect(result.generalError).toBeNull();
  });

  it("stops at a general error and does not attempt the remaining files", async () => {
    const attempted: string[] = [];
    const result = await uploadSequentially(
      items("contract", "deposit", "ktp"),
      async (key) => {
        attempted.push(key);
        return key === "deposit"
          ? { success: false, error: null, generalError: "Kode akses salah." }
          : OK;
      },
    );

    expect(attempted).toEqual(["contract", "deposit"]);
    expect(result.succeeded).toEqual(["contract"]);
    expect(result.generalError).toBe("Kode akses salah.");
  });

  it("treats a thrown error as a general failure, stops, and keeps earlier successes", async () => {
    const attempted: string[] = [];
    const result = await uploadSequentially(
      items("contract", "deposit", "ktp"),
      async (key) => {
        attempted.push(key);
        if (key === "deposit") throw new Error("network down");
        return OK;
      },
    );

    expect(attempted).toEqual(["contract", "deposit"]);
    expect(result.succeeded).toEqual(["contract"]);
    expect(result.generalError).toBe(UPLOAD_NETWORK_ERROR);
  });

  it("reports each finished upload as it settles, in order", async () => {
    const settled: [string, boolean][] = [];
    await uploadSequentially(
      items("a", "b", "c"),
      async (key) =>
        key === "b"
          ? { success: false, error: "Nope.", generalError: null }
          : OK,
      (key, outcome) => settled.push([key, outcome.success]),
    );

    expect(settled).toEqual([
      ["a", true],
      ["b", false],
      ["c", true],
    ]);
  });

  it("falls back to a generic message when a failed upload carries no text", async () => {
    const result = await uploadSequentially(items("a"), async () => ({
      success: false,
      error: null,
      generalError: null,
    }));
    expect(result.errors).toEqual({ a: "Upload gagal." });
  });

  it("does nothing for an empty list", async () => {
    let calls = 0;
    const result = await uploadSequentially([], async () => {
      calls++;
      return OK;
    });
    expect(calls).toBe(0);
    expect(result).toEqual({ succeeded: [], errors: {}, generalError: null });
  });
});
