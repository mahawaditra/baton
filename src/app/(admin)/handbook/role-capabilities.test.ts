import { describe, expect, it } from "vitest";
import { HANDBOOK_ROLES, ROLE_CAPABILITIES } from "./role-capabilities";

function rolesAllowed(label: string) {
  const capability = ROLE_CAPABILITIES.find((c) => c.label === label);
  if (!capability) throw new Error(`Unknown capability: ${label}`);
  return HANDBOOK_ROLES.filter(({ role }) => capability.allowed(role)).map(
    ({ role }) => role,
  );
}

describe("ROLE_CAPABILITIES", () => {
  it("keeps settings edits away from Pengurus and Staff", () => {
    expect(rolesAllowed("Ubah Loan Settings dan slot instrumen")).toEqual([
      "ketua",
      "overlord",
    ]);
  });

  it("lets only Pengurus and Overlord add a Ketua", () => {
    expect(rolesAllowed("Tambah Ketua")).toEqual(["pengurus", "overlord"]);
  });

  it("lets only the Overlord deactivate a Pengurus", () => {
    expect(rolesAllowed("Aktif/nonaktifin Pengurus")).toEqual(["overlord"]);
  });

  it("has no capability that adds a Pengurus or an Overlord", () => {
    const labels = ROLE_CAPABILITIES.map((c) => c.label);
    expect(labels).not.toContain("Tambah Pengurus");
    expect(labels).not.toContain("Tambah Overlord");
  });
});
