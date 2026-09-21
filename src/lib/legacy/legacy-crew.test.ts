import { describe, it, expect } from "vitest";
import { LEGACY_CREW, LEGACY_CREW_IMAGE_TYPES } from "./legacy-crew";

describe("LEGACY_CREW", () => {
  it("has one featured member and the rest in the small grid", () => {
    expect(LEGACY_CREW.filter((m) => m.featured)).toHaveLength(1);
    expect(LEGACY_CREW).toHaveLength(9);
  });

  it("gives every member a unique url-safe slug", () => {
    const slugs = LEGACY_CREW.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("gives every member a name, at least one line, and a servable image type", () => {
    for (const member of LEGACY_CREW) {
      expect(member.name.trim()).not.toBe("");
      expect(member.lines.length).toBeGreaterThan(0);
      expect(LEGACY_CREW_IMAGE_TYPES as readonly string[]).toContain(
        member.mimeType,
      );
    }
  });
});
