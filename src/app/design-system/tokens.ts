import { readFileSync } from "node:fs";
import path from "node:path";

type Declarations = Map<string, string>;

export type PaletteFamily = {
  name: string;
  steps: { step: string; value: string }[];
};

export type DesignTokens = {
  palette: PaletteFamily[];
  light: Declarations;
  dark: Declarations;
  textSizes: { name: string; size: string }[];
};

const PALETTE_SELECTOR = ":root";
const LIGHT_SELECTOR = ":root,\n.light";
const DARK_SELECTOR = ".dark";
const THEME_SELECTOR = "@theme";

function topLevelBlocks(css: string, selector: string): string[] {
  const blocks: string[] = [];
  const opener = `\n${selector} {\n`;
  let index = css.indexOf(opener);
  while (index !== -1) {
    const start = index + opener.length;
    const end = css.indexOf("\n}", start);
    blocks.push(css.slice(start, end));
    index = css.indexOf(opener, end);
  }
  return blocks;
}

function declarations(blocks: string[]): Declarations {
  const result: Declarations = new Map();
  for (const block of blocks) {
    for (const match of block.matchAll(/^ {2}--([a-z0-9-]+):\s*([^;]+);/gm)) {
      result.set(match[1], match[2].trim());
    }
  }
  return result;
}

function requireBlocks(css: string, selector: string): string[] {
  const blocks = topLevelBlocks(css, selector);
  if (blocks.length === 0) {
    throw new Error(
      `design-system tokens: no "${selector.replace("\n", " ")} {" block found in globals.css`,
    );
  }
  return blocks;
}

export function parseDesignTokens(rawCss: string): DesignTokens {
  const css = rawCss.replace(/\r\n/g, "\n");

  const palette: PaletteFamily[] = [];
  for (const [name, value] of declarations(
    requireBlocks(css, PALETTE_SELECTOR),
  )) {
    const match = name.match(/^([a-z]+)-(\d+)$/);
    if (!match) continue;
    const [, family, step] = match;
    let entry = palette.find((item) => item.name === family);
    if (!entry) {
      entry = { name: family, steps: [] };
      palette.push(entry);
    }
    entry.steps.push({ step, value });
  }

  const light = declarations(requireBlocks(css, LIGHT_SELECTOR));
  const dark = declarations(requireBlocks(css, DARK_SELECTOR));
  const theme = declarations(requireBlocks(css, THEME_SELECTOR));

  const textSizes = [...theme.keys()]
    .filter((key) => /^text-[a-z0-9-]+$/.test(key) && !key.includes("--"))
    .map((key) => ({
      name: key.slice("text-".length),
      size: theme.get(key) ?? "",
    }));

  if (palette.length === 0 || textSizes.length === 0) {
    throw new Error(
      "design-system tokens: palette or text sizes came back empty; check the globals.css format",
    );
  }
  for (const role of ["background", "foreground", "primary"]) {
    if (!light.has(role) || !dark.has(role)) {
      throw new Error(
        `design-system tokens: role --${role} is missing from the light or dark block`,
      );
    }
  }

  return { palette, light, dark, textSizes };
}

export function readDesignTokens(): DesignTokens {
  return parseDesignTokens(
    readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8"),
  );
}

export function paletteReference(value: string | undefined): string {
  if (!value) return "";
  const match = value.match(/^var\(--([a-z]+-\d+)\)$/);
  return match ? match[1] : value;
}
