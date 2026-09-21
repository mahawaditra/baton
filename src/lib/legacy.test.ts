import { describe, it, expect } from "vitest";
import {
  fitWithin,
  formatKetuaLine,
  lastSegment,
  twoDigitYear,
  usesTwoStaffColumns,
} from "./legacy";

describe("lastSegment", () => {
  it("takes the instrument after the slash", () => {
    expect(lastSegment("Brass/Trumpet")).toBe("Trumpet");
  });
  it("uses a section with no slash as it is", () => {
    expect(lastSegment("Percussion")).toBe("Percussion");
  });
  it("takes the very last part when there are several slashes", () => {
    expect(lastSegment("Strings/Violin/Violin 2")).toBe("Violin 2");
  });
  it("ignores spaces around the slash", () => {
    expect(lastSegment("Brass / Trumpet ")).toBe("Trumpet");
  });
  it("ignores a trailing slash instead of returning an empty string", () => {
    expect(lastSegment("Brass/")).toBe("Brass");
  });
});

describe("twoDigitYear", () => {
  it("keeps the last two digits of a four digit year", () => {
    expect(twoDigitYear("2020")).toBe("20");
    expect(twoDigitYear(2026)).toBe("26");
  });
  it("returns an empty string when there are no digits", () => {
    expect(twoDigitYear("")).toBe("");
    expect(twoDigitYear("abc")).toBe("");
  });
});

describe("formatKetuaLine", () => {
  it("joins the instrument, angkatan and term year like the wall placard", () => {
    expect(
      formatKetuaLine({ section: "Brass/Trumpet", angkatan: "2020", termYear: 2026 }),
    ).toBe("Trumpet '20 | Kadiv '26");
  });
  it("works for a section that has no specific instrument", () => {
    expect(
      formatKetuaLine({ section: "Percussion", angkatan: "2021", termYear: 2024 }),
    ).toBe("Percussion '21 | Kadiv '24");
  });
  it("drops the angkatan mark instead of printing an empty quote", () => {
    expect(
      formatKetuaLine({ section: "Brass/Trumpet", angkatan: "", termYear: 2026 }),
    ).toBe("Trumpet | Kadiv '26");
  });
});

describe("usesTwoStaffColumns", () => {
  it("stays on one column up to four names and switches at five", () => {
    expect(usesTwoStaffColumns(0)).toBe(false);
    expect(usesTwoStaffColumns(4)).toBe(false);
    expect(usesTwoStaffColumns(5)).toBe(true);
    expect(usesTwoStaffColumns(10)).toBe(true);
  });
});

describe("fitWithin", () => {
  it("shrinks a big photo to fit inside the box, keeping its shape", () => {
    expect(
      fitWithin({ naturalWidth: 1080, naturalHeight: 1080, maxWidth: 600, maxHeight: 700 }),
    ).toEqual({ width: 600, height: 600 });
  });

  it("is limited by the height for a tall photo", () => {
    expect(
      fitWithin({ naturalWidth: 800, naturalHeight: 1600, maxWidth: 900, maxHeight: 700 }),
    ).toEqual({ width: 350, height: 700 });
  });

  it("does not stretch a small photo unless upscaling is allowed", () => {
    expect(
      fitWithin({ naturalWidth: 320, naturalHeight: 320, maxWidth: 600, maxHeight: 600 }),
    ).toEqual({ width: 320, height: 320 });
  });

  it("stretches a small photo only up to the allowed upscale", () => {
    expect(
      fitWithin({
        naturalWidth: 320,
        naturalHeight: 320,
        maxWidth: 900,
        maxHeight: 900,
        maxUpscale: 1.5,
      }),
    ).toEqual({ width: 480, height: 480 });
  });

  it("never returns a size for an image that has not loaded yet", () => {
    expect(
      fitWithin({ naturalWidth: 0, naturalHeight: 0, maxWidth: 600, maxHeight: 600 }),
    ).toEqual({ width: 0, height: 0 });
  });
});
