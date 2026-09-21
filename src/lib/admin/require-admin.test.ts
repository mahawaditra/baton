import { describe, it, expect, vi, beforeEach } from "vitest";

const getSessionMock = vi.fn();

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: { getSession: (...args: unknown[]) => getSessionMock(...args) },
  },
}));

function session(user: { isActive: boolean; handoverAt: Date | null }) {
  return { user: { id: "a", role: "staff", ...user } };
}

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.resetModules();
    getSessionMock.mockReset();
  });

  it("returns the session of an active admin", async () => {
    const active = session({ isActive: true, handoverAt: null });
    getSessionMock.mockResolvedValue(active);
    const { requireAdmin } = await import("./require-admin");

    await expect(requireAdmin()).resolves.toBe(active);
  });

  it("refuses when there is no session", async () => {
    getSessionMock.mockResolvedValue(null);
    const { requireAdmin } = await import("./require-admin");

    await expect(requireAdmin()).rejects.toThrow("Not logged in");
  });

  it("refuses a deactivated admin even though their session cookie is still valid", async () => {
    getSessionMock.mockResolvedValue(
      session({ isActive: false, handoverAt: null }),
    );
    const { requireAdmin } = await import("./require-admin");

    await expect(requireAdmin()).rejects.toThrow("Not logged in");
  });

  it("refuses a Ketua who has already started the handover", async () => {
    getSessionMock.mockResolvedValue(
      session({ isActive: true, handoverAt: new Date("2026-09-21T00:00:00Z") }),
    );
    const { requireAdmin } = await import("./require-admin");

    await expect(requireAdmin()).rejects.toThrow("Not logged in");
  });
});
