type Area = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });
}

export async function getCroppedImg(
  imageSrc: string,
  crop: Area,
  rotation: number,
  maxWidth = 1000,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const rad = (rotation * Math.PI) / 180;

  const bBoxWidth =
    Math.abs(Math.cos(rad) * image.width) +
    Math.abs(Math.sin(rad) * image.height);
  const bBoxHeight =
    Math.abs(Math.sin(rad) * image.width) +
    Math.abs(Math.cos(rad) * image.height);

  const rotated = document.createElement("canvas");
  rotated.width = bBoxWidth;
  rotated.height = bBoxHeight;
  const rotatedCtx = rotated.getContext("2d")!;
  rotatedCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  rotatedCtx.rotate(rad);
  rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const scale = Math.min(1, maxWidth / crop.width);
  const outWidth = Math.round(crop.width * scale);
  const outHeight = Math.round(crop.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, outWidth, outHeight);
  ctx.drawImage(
    rotated,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outWidth,
    outHeight,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.85);
  });
}
