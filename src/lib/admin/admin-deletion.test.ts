import { describe, it, expect, vi } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
import { deleteAdminsKeepingHistory } from "./admin-deletion";

function fakeTx(admins: { id: string; name: string }[]) {
  const calls: string[] = [];
  const record = (label: string) =>
    vi.fn(async (args: unknown) => {
      calls.push(`${label} ${JSON.stringify(args)}`);
      return { count: 0 };
    });

  const tx = {
    admin: {
      findMany: vi.fn(async () => admins),
      deleteMany: record("admin.deleteMany"),
    },
    activityLog: { updateMany: record("activityLog.updateMany") },
    inventorySnapshot: { updateMany: record("inventorySnapshot.updateMany") },
    annualReport: { updateMany: record("annualReport.updateMany") },
  };

  return { tx: tx as unknown as Prisma.TransactionClient, calls, mocks: tx };
}

describe("deleteAdminsKeepingHistory", () => {
  it("does nothing at all for an empty list", async () => {
    const { tx, mocks } = fakeTx([]);
    await deleteAdminsKeepingHistory(tx, []);
    expect(mocks.admin.findMany).not.toHaveBeenCalled();
    expect(mocks.admin.deleteMany).not.toHaveBeenCalled();
  });

  it("copies each admin's name onto their logs, snapshots and reports", async () => {
    const { tx, mocks } = fakeTx([
      { id: "a1", name: "Dewa" },
      { id: "a2", name: "Aca" },
    ]);
    await deleteAdminsKeepingHistory(tx, ["a1", "a2"]);

    expect(mocks.activityLog.updateMany).toHaveBeenCalledWith({
      where: { adminId: "a1" },
      data: { adminName: "Dewa" },
    });
    expect(mocks.activityLog.updateMany).toHaveBeenCalledWith({
      where: { adminId: "a2" },
      data: { adminName: "Aca" },
    });
    expect(mocks.inventorySnapshot.updateMany).toHaveBeenCalledWith({
      where: { createdBy: "a1" },
      data: { creatorName: "Dewa" },
    });
    expect(mocks.annualReport.updateMany).toHaveBeenCalledWith({
      where: { createdBy: "a2" },
      data: { creatorName: "Aca" },
    });
  });

  it("saves every name before the delete, never after", async () => {
    const { tx, calls } = fakeTx([
      { id: "a1", name: "Dewa" },
      { id: "a2", name: "Aca" },
    ]);
    await deleteAdminsKeepingHistory(tx, ["a1", "a2"]);

    const deleteIndex = calls.findIndex((c) => c.startsWith("admin.deleteMany"));
    const beforeDelete = calls.slice(0, deleteIndex);

    expect(deleteIndex).toBe(calls.length - 1);
    expect(beforeDelete).toHaveLength(6);
    expect(beforeDelete.every((c) => c.includes("updateMany"))).toBe(true);
  });

  it("deletes exactly the requested admins in one call", async () => {
    const { tx, mocks } = fakeTx([{ id: "a1", name: "Dewa" }]);
    await deleteAdminsKeepingHistory(tx, ["a1"]);
    expect(mocks.admin.deleteMany).toHaveBeenCalledTimes(1);
    expect(mocks.admin.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["a1"] } },
    });
  });
});
