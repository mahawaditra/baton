import { describe, it, expect, vi } from "vitest";
import type { AdminRole, Prisma } from "@/generated/prisma/client";
import {
  buildTombstoneData,
  handoverDescription,
  handoverTitle,
  needsSignatoryUpdate,
  runCompleteHandover,
  runHandover,
} from "./handover";

type Scenario = {
  me?: {
    id: string;
    name: string;
    role: AdminRole;
    createdAt: Date;
    handoverAt: Date | null;
  } | null;
  existingByEmail?: Record<string, { role: AdminRole }>;
  loanSettings?: { signatorySection: string; signatoryYear: string } | null;
  staff?: { id: string; name: string }[];
  claimCount?: number;
};

function fakeTx(scenario: Scenario) {
  const writes: string[] = [];
  const write = (label: string) =>
    vi.fn(async (args: unknown) => {
      writes.push(label);
      return args;
    });

  const mocks = {
    admin: {
      findUnique: vi.fn(
        async (args: { where: { id?: string; email?: string } }) => {
          if (args.where.id) return scenario.me ?? null;
          return scenario.existingByEmail?.[args.where.email!] ?? null;
        },
      ),
      findMany: vi.fn(
        async (args: { where: { role?: string; id?: { in: string[] } } }) => {
          const staff = scenario.staff ?? [];
          if (args.where.role === "staff") return staff;
          const everyone = scenario.me
            ? [...staff, { id: scenario.me.id, name: scenario.me.name }]
            : staff;
          return everyone.filter((s) => args.where.id?.in.includes(s.id));
        },
      ),
      deleteMany: write("admin.deleteMany"),
      create: write("admin.create"),
      update: write("admin.update"),
    },
    loanSetting: {
      findFirst: vi.fn(async () => scenario.loanSettings ?? null),
    },
    tombstone: {
      create: write("tombstone.create"),
      updateMany: vi.fn(async () => {
        writes.push("tombstone.updateMany");
        return { count: scenario.claimCount ?? 1 };
      }),
    },
    activityLog: {
      create: write("activityLog.create"),
      updateMany: write("activityLog.updateMany"),
    },
    inventorySnapshot: { updateMany: write("inventorySnapshot.updateMany") },
    annualReport: { updateMany: write("annualReport.updateMany") },
  };

  return { tx: mocks as unknown as Prisma.TransactionClient, writes, mocks };
}

const ketua = {
  id: "me",
  name: "Hannan",
  role: "ketua" as const,
  createdAt: new Date("2026-03-10T05:00:00Z"),
  handoverAt: null,
};
const loanSettings = { signatorySection: "Brass/Trumpet", signatoryYear: "2020" };
const staff = [
  { id: "s1", name: "Dewa" },
  { id: "s2", name: "Hafizh" },
];
const params = { adminId: "me", email: "rani@example.com", name: "Rani" };

describe("runHandover", () => {
  it("removes the staff, seats the new ketua, and only then marks the old ketua as leaving", async () => {
    const { tx, writes, mocks } = fakeTx({ me: ketua, loanSettings, staff });

    const result = await runHandover(tx, params);

    expect(result).toEqual({ error: null });
    expect(writes[0]).toBe("tombstone.create");
    expect(writes[1]).toBe("activityLog.create");
    const deleted = writes.indexOf("admin.deleteMany");
    const created = writes.indexOf("admin.create");
    const marked = writes.indexOf("admin.update");
    expect(deleted).toBeGreaterThan(1);
    expect(created).toBeGreaterThan(deleted);
    expect(marked).toBeGreaterThan(created);
    expect(marked).toBe(writes.length - 1);

    expect(mocks.admin.create).toHaveBeenCalledWith({
      data: {
        email: "rani@example.com",
        name: "Rani",
        role: "ketua",
        emailVerified: true,
      },
    });
    expect(mocks.admin.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["s1", "s2"] } },
    });
    const updateArgs = mocks.admin.update.mock.calls[0][0] as {
      where: { id: string };
      data: { handoverAt: Date };
    };
    expect(updateArgs.where).toEqual({ id: "me" });
    expect(updateArgs.data.handoverAt).toBeInstanceOf(Date);
  });

  it("records the tombstone and the activity log before anyone is deleted", async () => {
    const { tx, mocks } = fakeTx({ me: ketua, loanSettings, staff });

    await runHandover(tx, params);

    expect(mocks.tombstone.create).toHaveBeenCalledWith({
      data: {
        termYear: 2026,
        ketuaName: "Hannan",
        ketuaSection: "Brass/Trumpet",
        ketuaAngkatan: "2020",
        staffNames: ["Dewa", "Hafizh"],
        ketuaAdminId: "me",
      },
    });
    expect(mocks.activityLog.create).toHaveBeenCalledWith({
      data: {
        adminId: "me",
        action: "handover_ketua",
        entityType: "admin",
        entityId: "me",
        metadata: {
          newKetua: { name: "Rani", email: "rani@example.com" },
          deletedStaff: ["Dewa", "Hafizh"],
        },
      },
    });
  });

  it("lets a current staff member become the new ketua, deleting them first so the email is free", async () => {
    const { tx, writes } = fakeTx({
      me: ketua,
      loanSettings,
      staff,
      existingByEmail: { "dewa@example.com": { role: "staff" } },
    });

    const result = await runHandover(tx, {
      ...params,
      email: "dewa@example.com",
      name: "Dewa",
    });

    expect(result).toEqual({ error: null });
    expect(writes.indexOf("admin.deleteMany")).toBeLessThan(
      writes.indexOf("admin.create"),
    );
  });

  it.each(["ketua", "pengurus", "overlord"] as const)(
    "refuses an email that already belongs to a %s and writes nothing",
    async (role) => {
      const { tx, writes } = fakeTx({
        me: ketua,
        loanSettings,
        staff,
        existingByEmail: { "rani@example.com": { role } },
      });

      const result = await runHandover(tx, params);

      expect(result.error).toContain("rani@example.com is already registered");
      expect(writes).toEqual([]);
    },
  );

  it("refuses anyone who is not a ketua and writes nothing", async () => {
    for (const role of ["staff", "pengurus", "overlord"] as const) {
      const { tx, writes } = fakeTx({
        me: { ...ketua, role },
        loanSettings,
        staff,
      });
      const result = await runHandover(tx, params);
      expect(result.error).toBe("Only the Ketua can hand over the position.");
      expect(writes).toEqual([]);
    }
  });

  it("refuses when the account no longer exists", async () => {
    const { tx, writes } = fakeTx({ me: null, loanSettings, staff });
    const result = await runHandover(tx, params);
    expect(result.error).toBe("Only the Ketua can hand over the position.");
    expect(writes).toEqual([]);
  });

  it("refuses a second handover once one has started and writes nothing", async () => {
    const { tx, writes } = fakeTx({
      me: { ...ketua, handoverAt: new Date() },
      loanSettings,
      staff,
    });
    const result = await runHandover(tx, params);
    expect(result.error).toBe("You have already started the handover.");
    expect(writes).toEqual([]);
  });

  it("refuses when loan settings do not exist yet and writes nothing", async () => {
    const { tx, writes } = fakeTx({ me: ketua, loanSettings: null, staff });
    const result = await runHandover(tx, params);
    expect(result.error).toContain("Fill in Loan Settings first");
    expect(writes).toEqual([]);
  });

  it("still works when there is no staff to remove", async () => {
    const { tx, mocks } = fakeTx({ me: ketua, loanSettings, staff: [] });
    const result = await runHandover(tx, params);
    expect(result).toEqual({ error: null });
    expect(mocks.admin.deleteMany).not.toHaveBeenCalled();
    expect(mocks.admin.create).toHaveBeenCalledTimes(1);
  });
});

describe("handoverTitle", () => {
  it("counts the staff who are about to be deleted", () => {
    expect(handoverTitle(3)).toBe("DELETE all 3 staff including you?");
    expect(handoverTitle(1)).toBe("DELETE all 1 staff including you?");
  });
  it("does not say '0 staff' when nobody else is affected", () => {
    expect(handoverTitle(0)).toBe("DELETE your position as Ketua Logistik?");
  });
});

describe("handoverDescription", () => {
  it("mentions the comrades only when there are staff to lose access", () => {
    expect(handoverDescription(3)).toContain("You and your comrades will lose");
    expect(handoverDescription(0)).not.toContain("comrades");
    expect(handoverDescription(0)).toContain("You will lose all access");
  });
  it("never uses the old 'minions' wording", () => {
    expect(handoverDescription(3)).not.toContain("minions");
  });
});

describe("buildTombstoneData", () => {
  const base = {
    ketuaAdminId: "ketua-id",
    ketuaName: "Hannan",
    signatorySection: "Brass/Trumpet",
    signatoryYear: "2020",
    staffNames: ["Dewa", "Hafizh", "Aca"],
  };

  it("copies the raw section, angkatan and ordered staff names as they were", () => {
    const data = buildTombstoneData({
      ...base,
      ketuaCreatedAt: new Date("2026-03-10T05:00:00Z"),
    });
    expect(data).toEqual({
      termYear: 2026,
      ketuaName: "Hannan",
      ketuaSection: "Brass/Trumpet",
      ketuaAngkatan: "2020",
      staffNames: ["Dewa", "Hafizh", "Aca"],
      ketuaAdminId: "ketua-id",
    });
  });

  it("takes the term year from the Jakarta calendar, not UTC", () => {
    const data = buildTombstoneData({
      ...base,
      ketuaCreatedAt: new Date("2025-12-31T18:00:00Z"),
    });
    expect(data.termYear).toBe(2026);
  });

  it("keeps the previous year for a moment that is still December in Jakarta", () => {
    const data = buildTombstoneData({
      ...base,
      ketuaCreatedAt: new Date("2025-12-31T16:59:00Z"),
    });
    expect(data.termYear).toBe(2025);
  });
});

describe("needsSignatoryUpdate", () => {
  it("nags a ketua whose loan settings were last saved by someone else", () => {
    expect(needsSignatoryUpdate("ketua", "me", { updatedBy: "previous" })).toBe(
      true,
    );
  });
  it("nags a ketua when the last saver is gone (updatedBy became null)", () => {
    expect(needsSignatoryUpdate("ketua", "me", { updatedBy: null })).toBe(true);
  });
  it("nags a ketua when loan settings do not exist yet", () => {
    expect(needsSignatoryUpdate("ketua", "me", null)).toBe(true);
  });
  it("stops nagging once the ketua saved the settings themselves", () => {
    expect(needsSignatoryUpdate("ketua", "me", { updatedBy: "me" })).toBe(
      false,
    );
  });
  it("only ever nags a ketua", () => {
    for (const role of ["staff", "pengurus", "overlord"] as const) {
      expect(needsSignatoryUpdate(role, "me", { updatedBy: null })).toBe(false);
    }
  });
});

describe("runCompleteHandover", () => {
  const leaving = { ...ketua, handoverAt: new Date("2026-09-20T10:00:00Z") };
  const done = { adminId: "me", tombstoneId: "t1", driveFileId: "drive-1" };

  it("attaches the photo, logs it, and only then deletes the leaving ketua", async () => {
    const { tx, writes, mocks } = fakeTx({ me: leaving });

    const result = await runCompleteHandover(tx, done);

    expect(result).toEqual({ error: null });
    expect(writes[0]).toBe("tombstone.updateMany");
    expect(writes[1]).toBe("activityLog.create");
    expect(writes[writes.length - 1]).toBe("admin.deleteMany");
    expect(mocks.tombstone.updateMany).toHaveBeenCalledWith({
      where: { id: "t1", ketuaAdminId: "me", photoDriveFileId: null },
      data: { photoDriveFileId: "drive-1" },
    });
    expect(mocks.activityLog.create).toHaveBeenCalledWith({
      data: {
        adminId: "me",
        action: "complete_handover",
        entityType: "admin",
        entityId: "me",
      },
    });
    expect(mocks.activityLog.updateMany).toHaveBeenCalledWith({
      where: { adminId: "me" },
      data: { adminName: "Hannan" },
    });
    expect(mocks.admin.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["me"] } },
    });
  });

  it("refuses an account that is not in the middle of a handover and writes nothing", async () => {
    for (const me of [
      ketua,
      { ...leaving, role: "staff" as const },
      null,
    ]) {
      const { tx, writes } = fakeTx({ me });
      const result = await runCompleteHandover(tx, done);
      expect(result.error).toBe(
        "There is no handover in progress for this account.",
      );
      expect(writes).toEqual([]);
    }
  });

  it("stops without deleting anyone when the tombstone was already completed", async () => {
    const { tx, writes, mocks } = fakeTx({ me: leaving, claimCount: 0 });

    const result = await runCompleteHandover(tx, done);

    expect(result.error).toBe("This handover has already been completed.");
    expect(writes).toEqual(["tombstone.updateMany"]);
    expect(mocks.admin.deleteMany).not.toHaveBeenCalled();
  });
});
