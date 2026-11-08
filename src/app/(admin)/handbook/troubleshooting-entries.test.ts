import { describe, expect, it } from "vitest";
import {
  TROUBLESHOOTING_GROUPS,
  filterTroubleshootingGroups,
} from "./troubleshooting-entries";

const allEntries = TROUBLESHOOTING_GROUPS.flatMap((group) => group.entries);

describe("TROUBLESHOOTING_GROUPS", () => {
  it("gives every entry a unique id, a reason, and a next step", () => {
    expect(new Set(allEntries.map((entry) => entry.id)).size).toBe(
      allEntries.length,
    );
    for (const entry of allEntries) {
      expect(entry.why.length).toBeGreaterThan(0);
      expect(entry.steps.length).toBeGreaterThan(0);
    }
  });
});

describe("filterTroubleshootingGroups", () => {
  it("keeps everything with no query and no owner filter", () => {
    expect(
      filterTroubleshootingGroups(TROUBLESHOOTING_GROUPS, "  ", "all"),
    ).toEqual(TROUBLESHOOTING_GROUPS);
  });

  it("filters by who can fix it and drops groups left empty", () => {
    const result = filterTroubleshootingGroups(
      TROUBLESHOOTING_GROUPS,
      "",
      "ketua",
    );
    const entries = result.flatMap((group) => group.entries);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.owner === "ketua")).toBe(true);
    expect(result.every((group) => group.entries.length > 0)).toBe(true);
  });

  it("searches titles, reasons, steps, notes and warnings, ignoring case", () => {
    const idsFor = (query: string) =>
      filterTroubleshootingGroups(TROUBLESHOOTING_GROUPS, query, "all")
        .flatMap((group) => group.entries)
        .map((entry) => entry.id);

    expect(idsFor("LINK LINE")).toContain("link-line");
    expect(idsFor("add friend")).toContain("link-line");
    expect(idsFor("jangan bandel")).toContain("kondisi-terkunci");
    expect(idsFor("delete/replace")).toContain("foto-addendum");
    expect(idsFor("pre-baton")).toContain("pre-baton-di-share");
    expect(idsFor("loanable")).toContain("nggak-muncul-di-assign");
  });

  it("returns nothing when nothing matches", () => {
    expect(
      filterTroubleshootingGroups(TROUBLESHOOTING_GROUPS, "zzzqq", "all"),
    ).toEqual([]);
  });
});
