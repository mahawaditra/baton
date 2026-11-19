import { describe, expect, it } from "vitest";
import {
  paletteReference,
  parseDesignTokens,
  readDesignTokens,
} from "./tokens";

describe("readDesignTokens", () => {
  const tokens = readDesignTokens();

  it("reads every palette family from globals.css", () => {
    const families = tokens.palette.map((family) => family.name);
    for (const family of ["cream", "night", "ink", "gold", "plum"]) {
      expect(families).toContain(family);
    }
    for (const family of tokens.palette) {
      expect(family.steps.length).toBeGreaterThan(0);
      for (const { value } of family.steps) {
        expect(value).toMatch(/^oklch\(/);
      }
    }
  });

  it("maps role tokens for both schemes", () => {
    expect(tokens.light.get("primary")).toMatch(/^var\(--[a-z]+-\d+\)$/);
    expect(tokens.dark.get("primary")).toMatch(/^var\(--[a-z]+-\d+\)$/);
    expect(tokens.light.get("background")).not.toBe(
      tokens.dark.get("background"),
    );
  });

  it("reads the type scale", () => {
    expect(tokens.textSizes.map((size) => size.name)).toEqual(
      expect.arrayContaining(["display", "h1", "body", "micro"]),
    );
  });
});

describe("parseDesignTokens", () => {
  it("fails loudly when a block is missing", () => {
    expect(() => parseDesignTokens(":root {\n  --x: 1;\n}\n")).toThrow(
      /no ".+ \{" block/,
    );
  });
});

describe("paletteReference", () => {
  it("shortens a palette var and leaves anything else alone", () => {
    expect(paletteReference("var(--ink-800)")).toBe("ink-800");
    expect(paletteReference("color-mix(in oklch, red, blue)")).toBe(
      "color-mix(in oklch, red, blue)",
    );
    expect(paletteReference(undefined)).toBe("");
  });
});
