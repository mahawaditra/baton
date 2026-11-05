import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { ADMIN_PATH_SEGMENTS } from "./admin-host";

function topLevelFolders(group: string): string[] {
  return readdirSync(join(process.cwd(), "src", "app", group), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

describe("ADMIN_PATH_SEGMENTS", () => {
  it("lists exactly the top-level folders of the (admin) and (admin-auth) route groups", () => {
    const folders = [
      ...topLevelFolders("(admin)"),
      ...topLevelFolders("(admin-auth)"),
    ].sort();

    expect([...ADMIN_PATH_SEGMENTS].sort()).toEqual(folders);
  });
});
