export function lastSegment(section: string): string {
  const parts = section
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : section.trim();
}

export function twoDigitYear(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  return digits.slice(-2);
}

export function formatKetuaLine(params: {
  section: string;
  angkatan: string;
  termYear: number;
}): string {
  const instrument = lastSegment(params.section);
  const angkatan = twoDigitYear(params.angkatan);
  const term = twoDigitYear(params.termYear);

  const left = angkatan ? `${instrument} '${angkatan}` : instrument;
  const right = term ? `Kadiv '${term}` : "Kadiv";
  return `${left} | ${right}`;
}

export const LEGACY_STAFF_TWO_COLUMN_FROM = 5;

export function usesTwoStaffColumns(staffCount: number): boolean {
  return staffCount >= LEGACY_STAFF_TWO_COLUMN_FROM;
}

export function fitWithin(params: {
  naturalWidth: number;
  naturalHeight: number;
  maxWidth: number;
  maxHeight: number;
  maxUpscale?: number;
}): { width: number; height: number } {
  const { naturalWidth, naturalHeight, maxWidth, maxHeight } = params;
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: 0, height: 0 };
  }
  const scale = Math.min(
    maxWidth / naturalWidth,
    maxHeight / naturalHeight,
    params.maxUpscale ?? 1,
  );
  return {
    width: Math.round(naturalWidth * scale),
    height: Math.round(naturalHeight * scale),
  };
}
