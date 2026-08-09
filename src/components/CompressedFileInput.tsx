"use client";

import { useRef } from "react";

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

export function CompressedFileInput({
  name,
  accept,
  multiple = false,
  required = false,
}: {
  name: string;
  accept: string;
  multiple?: boolean;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const processed = await Promise.all(
      Array.from(files).map(async (file) => {
        if (!file.type.startsWith("image/")) return file;
        try {
          return await compressImage(file);
        } catch {
          return file;
        }
      }),
    );

    const dataTransfer = new DataTransfer();
    for (const file of processed) {
      dataTransfer.items.add(file);
    }
    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }
  }

  return (
    <input
      ref={inputRef}
      name={name}
      type="file"
      accept={accept}
      multiple={multiple}
      required={required}
      onChange={handleChange}
    />
  );
}
