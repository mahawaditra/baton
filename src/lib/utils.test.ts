import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { CUSTOM_FONT_SIZES, cn, toggleSetValue } from "./utils";

describe("cn", () => {
  it("keeps a custom font-size token when a text color follows", () => {
    expect(
      cn("px-2 text-micro uppercase", "bg-gold-soft", "text-gold-soft-foreground"),
    ).toBe("px-2 text-micro uppercase bg-gold-soft text-gold-soft-foreground");
  });

  it("keeps a text color when a custom font-size token follows", () => {
    expect(cn("text-primary-foreground", "text-caption")).toBe(
      "text-primary-foreground text-caption",
    );
  });

  it("lets a later font size replace an earlier one", () => {
    expect(cn("text-sm", "text-caption")).toBe("text-caption");
    expect(cn("text-caption", "text-sm")).toBe("text-sm");
    expect(cn("text-body", "text-title")).toBe("text-title");
  });

  it("still lets a later text color replace an earlier one", () => {
    expect(cn("text-muted-foreground", "text-foreground")).toBe(
      "text-foreground",
    );
  });

  it("drops an earlier leading class when a size token sets its own line height", () => {
    expect(cn("leading-6", "text-body")).toBe("text-body");
    expect(cn("text-body", "leading-6")).toBe("text-body leading-6");
  });
});

describe("CUSTOM_FONT_SIZES", () => {
  it("matches every --text-* size token declared in globals.css", () => {
    const css = readFileSync(
      join(process.cwd(), "src", "app", "globals.css"),
      "utf8",
    );
    const declared = [
      ...css.matchAll(/^\s*--text-([a-z0-9]+(?:-[a-z0-9]+)*):/gm),
    ].map((match) => match[1]);

    expect([...CUSTOM_FONT_SIZES].sort()).toEqual([...declared].sort());
  });
});

describe("toggleSetValue", () => {
  it("adds a missing value and removes an existing one without mutating", () => {
    const original = new Set(["a"]);
    const added = toggleSetValue(original, "b");
    const removed = toggleSetValue(added, "a");

    expect([...original]).toEqual(["a"]);
    expect([...added].sort()).toEqual(["a", "b"]);
    expect([...removed]).toEqual(["b"]);
  });
});
