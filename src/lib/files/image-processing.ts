const HEIC_FTYP_BRANDS = ["mif1", "msf1", "heic", "heix", "hevc", "hevx"];

export async function looksLikeHeic(file: File): Promise<boolean> {
  const header = new Uint8Array(await file.slice(8, 12).arrayBuffer());
  const brand = new TextDecoder("utf-8").decode(header).replace("\0", " ").trim();
  return HEIC_FTYP_BRANDS.includes(brand);
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const { heicTo } = await import("heic-to/next");
  const jpegBlob = await heicTo({ blob: file, type: "image/jpeg", quality: 0.85 });
  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([jpegBlob], newName, { type: "image/jpeg" });
}

async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.85,
): Promise<File> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality);
  });

  return new File([blob], file.name, { type: "image/jpeg" });
}

export async function prepareImageFile(file: File): Promise<File> {
  let working = file;

  if (await looksLikeHeic(working)) {
    try {
      working = await convertHeicToJpeg(working);
    } catch {}
  }

  if (!working.type.startsWith("image/")) return working;
  return compressImage(working);
}
