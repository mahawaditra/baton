"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

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
  id,
  format = "image/jpeg",
}: {
  name: string;
  id?: string;
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
      id={id ?? name}
      name={name}
      type="file"
      accept="image/*"
      onChange={handleChange}
      className={cn(
        "h-10 w-full min-w-0 rounded border border-input bg-surface px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      )}
    />
  );
}
