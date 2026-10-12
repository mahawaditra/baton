import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { ADMIN_PATH_SEGMENTS } from "./admin-host";

describe("ADMIN_PATH_SEGMENTS", () => {
  it("lists exactly the top-level folders of the (admin) route group", () => {
    const adminDir = join(process.cwd(), "src", "app", "(admin)");
    const folders = readdirSync(adminDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect([...ADMIN_PATH_SEGMENTS].sort()).toEqual(folders);
  });
});
