import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { withServerErrorFallback } from "./server-action-fallback";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

describe("withServerErrorFallback", () => {
  beforeEach(() => {
    vi.mocked(Sentry.captureException).mockClear();
  });

  it("passes the action result through when nothing throws", async () => {
    const result = await withServerErrorFallback(
      async () => "ok",
      () => "fallback",
    );
    expect(result).toBe("ok");
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("reports an unexpected error and returns the fallback state", async () => {
    const error = new Error("Drive 404");
    const result = await withServerErrorFallback(
      async () => {
        throw error;
      },
      () => "fallback",
    );
    expect(result).toBe("fallback");
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it("rethrows Next.js redirects instead of swallowing them", async () => {
    await expect(
      withServerErrorFallback(
        async () => redirect("/status/26071234"),
        () => "fallback",
      ),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
