import * as XLSX from "xlsx/xlsx.mjs";

export function buildXlsxBuffer(
  rows: Record<string, unknown>[],
  sheetName: string,
): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
