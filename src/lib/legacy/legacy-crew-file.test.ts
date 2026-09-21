import fs from "fs";
import { describe, it, expect } from "vitest";
import { LEGACY_CREW } from "./legacy-crew";
import { patchLegacyCrewSource } from "./legacy-crew-file";

const source = fs.readFileSync("src/lib/legacy/legacy-crew.ts", "utf8");

function entryOf(text: string, slug: string) {
  const start = text.indexOf(`slug: "${slug}"`);
  return text.slice(start, text.indexOf("\n  },", start));
}

describe("patchLegacyCrewSource", () => {
  it("writes the file id and mime type into the right member only", () => {
    const patched = patchLegacyCrewSource(source, {
      slug: "kenichi",
      fileId: "abc123",
      mimeType: "image/jpeg",
    });

    const kenichi = entryOf(patched, "kenichi");
    expect(kenichi).toContain('photoDriveFileId: "abc123",');
    expect(kenichi).toContain('mimeType: "image/jpeg",');

    for (const member of LEGACY_CREW) {
      if (member.slug === "kenichi") continue;
      expect(entryOf(patched, member.slug)).toBe(entryOf(source, member.slug));
    }
  });

  it("works for the featured member, which has an extra field before the photo", () => {
    const patched = patchLegacyCrewSource(source, {
      slug: "haseulbintaro",
      fileId: "fid",
      mimeType: "image/gif",
    });
    const entry = entryOf(patched, "haseulbintaro");
    expect(entry).toContain("featured: true,");
    expect(entry).toContain('photoDriveFileId: "fid",');
  });

  it("can be patched for every member, one after another", () => {
    let text = source;
    for (const member of LEGACY_CREW) {
      text = patchLegacyCrewSource(text, {
        slug: member.slug,
        fileId: `id-${member.slug}`,
        mimeType: "image/png",
      });
    }
    for (const member of LEGACY_CREW) {
      const entry = entryOf(text, member.slug);
      expect(entry).toContain(`photoDriveFileId: "id-${member.slug}",`);
      expect(entry).toContain('mimeType: "image/png",');
    }
  });

  it("replaces an id that was already written, so a rerun is harmless", () => {
    const once = patchLegacyCrewSource(source, {
      slug: "adit",
      fileId: "first",
      mimeType: "image/gif",
    });
    const twice = patchLegacyCrewSource(once, {
      slug: "adit",
      fileId: "second",
      mimeType: "image/gif",
    });
    const adit = entryOf(twice, "adit");
    expect(adit).toContain('photoDriveFileId: "second",');
    expect(adit).not.toContain("first");
  });

  it("leaves names and lines untouched", () => {
    const patched = patchLegacyCrewSource(source, {
      slug: "bamjo",
      fileId: "x",
      mimeType: "image/gif",
    });
    const before = entryOf(source, "bamjo");
    const after = entryOf(patched, "bamjo");
    expect(after).toContain(before.split("\n").find((l) => l.includes("lines:"))!);
    expect(after).toContain('name: "BAMJO"');
  });

  it("refuses a slug that does not exist instead of silently doing nothing", () => {
    expect(() =>
      patchLegacyCrewSource(source, {
        slug: "nobody",
        fileId: "x",
        mimeType: "image/gif",
      }),
    ).toThrow(/nobody/);
  });
});
