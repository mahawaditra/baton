"use client";

import { useRef } from "react";

async function compressImage(
  file: File,
  maxWidth = 1600,
  quality = 0.8,
  format: "image/jpeg" | "image/png" = "image/jpeg",
): Promise<Blob> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext("2d")!;

  if (format !== "image/png") {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), format, quality);
  });
}

export function CompressedImageInput({
  name,
  format = "image/jpeg",
}: {
  name: string;
  format?: "image/jpeg" | "image/png";
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressedBlob = await compressImage(file, 1600, 0.8, format);
    const compressedFile = new File([compressedBlob], file.name, {
      type: format,
    });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(compressedFile);
    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }
  }

  return (
    <input
      ref={inputRef}
      name={name}
      type="file"
      accept="image/*"
      onChange={handleChange}
    />
  );
}
