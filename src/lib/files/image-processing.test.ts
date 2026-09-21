import { describe, it, expect } from "vitest";
import { looksLikeHeic } from "./image-processing";

function fileWithBrand(brand: string): File {
  const bytes = new Uint8Array(24);
  bytes.set([0x00, 0x00, 0x00, 0x18], 0);
  bytes.set(new TextEncoder().encode("ftyp"), 4);
  bytes.set(new TextEncoder().encode(brand), 8);
  return new File([bytes], "photo");
}

describe("looksLikeHeic", () => {
  it.each(["heic", "heix", "mif1", "msf1", "hevc", "hevx"])(
    "recognises the %s brand",
    async (brand) => {
      expect(await looksLikeHeic(fileWithBrand(brand))).toBe(true);
    },
  );

  it("rejects a JPEG header", async () => {
    const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1])], "a.jpg");
    expect(await looksLikeHeic(jpeg)).toBe(false);
  });

  it("rejects an unrelated ftyp brand such as mp4", async () => {
    expect(await looksLikeHeic(fileWithBrand("isom"))).toBe(false);
  });

  it("rejects a file too short to have a brand", async () => {
    expect(await looksLikeHeic(new File([new Uint8Array([1, 2, 3])], "x"))).toBe(
      false,
    );
  });
});
