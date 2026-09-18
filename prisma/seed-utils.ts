export function text(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

export function requiredText(
  value: unknown,
  column: string,
  rowNumber: number,
): string {
  const result = text(value);
  if (result === null) {
    throw new Error(`Seed file row ${rowNumber}: ${column} is required but blank.`);
  }
  return result;
}
