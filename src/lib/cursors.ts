export const CURSOR_NAMES = ["normal", "link", "text", "unavailable"] as const;

export type CursorName = (typeof CURSOR_NAMES)[number];

export const PRELOADED_CURSORS: CursorName[] = ["normal", "link", "text"];

export function cursorFile(name: CursorName) {
  return `/cursors/${name}.cur`;
}
