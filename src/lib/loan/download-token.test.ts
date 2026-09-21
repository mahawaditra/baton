import crypto from "crypto";
import { describe, it, expect, beforeAll } from "vitest";
import { signDownloadToken, verifyDownloadToken } from "./download-token";

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET = "test-secret-do-not-use-in-production";
});

describe("download token", () => {
  it("verifies a token signed for the same ticket", () => {
    const token = signDownloadToken("TICKET-1");
    expect(verifyDownloadToken(token, "TICKET-1")).toBe(true);
  });

  it("rejects a token checked against a different ticket", () => {
    const token = signDownloadToken("TICKET-1");
    expect(verifyDownloadToken(token, "TICKET-2")).toBe(false);
  });

  it("rejects a payload swapped onto someone else's signature", () => {
    const [, signature] = signDownloadToken("TICKET-1").split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ ticketId: "TICKET-EVIL", exp: Date.now() + 60_000 }),
    ).toString("base64url");
    expect(
      verifyDownloadToken(`${forgedPayload}.${signature}`, "TICKET-EVIL"),
    ).toBe(false);
  });

  it("rejects a malformed token", () => {
    expect(verifyDownloadToken("not-a-real-token", "TICKET-1")).toBe(false);
    expect(verifyDownloadToken("", "TICKET-1")).toBe(false);
  });

  it("rejects an expired token", () => {
    const expiredPayload = Buffer.from(
      JSON.stringify({ ticketId: "TICKET-1", exp: Date.now() - 1000 }),
    ).toString("base64url");
    const signature = crypto
      .createHmac("sha256", process.env.BETTER_AUTH_SECRET!)
      .update(expiredPayload)
      .digest("base64url");
    expect(
      verifyDownloadToken(`${expiredPayload}.${signature}`, "TICKET-1"),
    ).toBe(false);
  });
});
