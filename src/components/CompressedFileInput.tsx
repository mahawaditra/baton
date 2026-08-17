"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
  id,
  name,
  accept,
  multiple = false,
  required = false,
  onCompressingChange,
}: {
  id?: string;
  name: string;
  accept: string;
  multiple?: boolean;
  required?: boolean;
  onCompressingChange?: (isCompressing: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    onCompressingChange?.(true);

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

    setIsCompressing(false);
    onCompressingChange?.(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        id={id ?? name}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={isCompressing}
        onChange={handleChange}
        className={cn(
          "h-10 w-full min-w-0 rounded border border-input bg-surface px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:mr-2 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        )}
      />
      {isCompressing && (
        <p className="text-xs text-muted-foreground">Memproses foto...</p>
      )}
    </div>
  );
}
