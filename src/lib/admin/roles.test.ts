import { describe, it, expect } from "vitest";
import type { AdminRole } from "@/generated/prisma/client";
import {
  assignableRoles,
  canEditSettings,
  canManage,
  canSetActive,
  canViewAdminManagement,
  roleRank,
} from "./roles";

const ALL_ROLES: AdminRole[] = ["staff", "ketua", "pengurus", "overlord"];

describe("roleRank", () => {
  it("orders staff < ketua < pengurus < overlord", () => {
    expect(roleRank("staff")).toBeLessThan(roleRank("ketua"));
    expect(roleRank("ketua")).toBeLessThan(roleRank("pengurus"));
    expect(roleRank("pengurus")).toBeLessThan(roleRank("overlord"));
  });
});

describe("canManage", () => {
  const expected: Record<AdminRole, AdminRole[]> = {
    staff: [],
    ketua: ["staff"],
    pengurus: ["staff", "ketua"],
    overlord: ["staff", "ketua", "pengurus"],
  };

  for (const actor of ALL_ROLES) {
    for (const target of ALL_ROLES) {
      const allowed = expected[actor].includes(target);
      it(`${actor} ${allowed ? "can" : "cannot"} manage ${target}`, () => {
        expect(canManage(actor, target)).toBe(allowed);
      });
    }
  }
});

describe("canSetActive", () => {
  it("never lets someone change their own status, whatever their role", () => {
    for (const role of ALL_ROLES) {
      expect(
        canSetActive({ id: "a", role }, { id: "a", role }),
      ).toBe(false);
    }
  });

  it("lets a ketua manage a staff member but not another ketua", () => {
    expect(
      canSetActive(
        { id: "a", role: "ketua" },
        { id: "b", role: "staff" },
      ),
    ).toBe(true);
    expect(
      canSetActive(
        { id: "a", role: "ketua" },
        { id: "b", role: "ketua" },
      ),
    ).toBe(false);
  });

  it("stops a ketua from touching pengurus or overlord", () => {
    expect(
      canSetActive(
        { id: "a", role: "ketua" },
        { id: "b", role: "overlord" },
      ),
    ).toBe(false);
    expect(
      canSetActive(
        { id: "a", role: "ketua" },
        { id: "b", role: "pengurus" },
      ),
    ).toBe(false);
  });

  it("lets only an overlord manage a pengurus", () => {
    expect(
      canSetActive(
        { id: "a", role: "overlord" },
        { id: "b", role: "pengurus" },
      ),
    ).toBe(true);
    expect(
      canSetActive(
        { id: "a", role: "pengurus" },
        { id: "b", role: "pengurus" },
      ),
    ).toBe(false);
  });
});

describe("canEditSettings", () => {
  it("allows ketua and overlord only", () => {
    expect(canEditSettings("staff")).toBe(false);
    expect(canEditSettings("pengurus")).toBe(false);
    expect(canEditSettings("ketua")).toBe(true);
    expect(canEditSettings("overlord")).toBe(true);
  });
});

describe("canViewAdminManagement", () => {
  it("hides admin management from staff only", () => {
    expect(canViewAdminManagement("staff")).toBe(false);
    expect(canViewAdminManagement("pengurus")).toBe(true);
    expect(canViewAdminManagement("ketua")).toBe(true);
    expect(canViewAdminManagement("overlord")).toBe(true);
  });
});

describe("assignableRoles", () => {
  it("gives staff nothing, ketua only staff, pengurus and overlord staff or ketua", () => {
    expect(assignableRoles("staff")).toEqual([]);
    expect(assignableRoles("ketua")).toEqual(["staff"]);
    expect(assignableRoles("pengurus")).toEqual(["staff", "ketua"]);
    expect(assignableRoles("overlord")).toEqual(["staff", "ketua"]);
  });

  it("only offers roles the actor could also manage afterwards", () => {
    for (const actor of ALL_ROLES) {
      for (const role of assignableRoles(actor)) {
        expect(canManage(actor, role)).toBe(true);
      }
    }
  });
});
