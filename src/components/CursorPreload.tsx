"use client";

import { preload } from "react-dom";
import { cursorFile, PRELOADED_CURSORS } from "@/lib/cursors";

export function CursorPreload() {
  for (const name of PRELOADED_CURSORS) {
    preload(cursorFile(name), { as: "image" });
  }
  return null;
}
