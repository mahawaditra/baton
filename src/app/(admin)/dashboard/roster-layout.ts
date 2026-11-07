export const ROSTER_TABLE_CLASS =
  "w-full min-w-[720px] table-fixed text-sm break-words";

export const ROSTER_COLUMN_WIDTHS = [
  "w-[19%]",
  "w-[9%]",
  "w-[18%]",
  "w-[16%]",
  "w-[16%]",
  "w-[22%]",
] as const;

export function rosterColumnPadding(index: number) {
  if (index === 0) return "pr-4 pl-6";
  if (index === ROSTER_COLUMN_WIDTHS.length - 1) return "pr-6 pl-4";
  return "px-4";
}
