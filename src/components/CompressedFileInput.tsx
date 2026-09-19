"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const HEIC_FTYP_BRANDS = ["mif1", "msf1", "heic", "heix", "hevc", "hevx"];

async function looksLikeHeic(file: File): Promise<boolean> {
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
        let workingFile = file;

        if (await looksLikeHeic(workingFile)) {
          try {
            workingFile = await convertHeicToJpeg(workingFile);
          } catch {}
        }

        if (!workingFile.type.startsWith("image/")) return workingFile;
        try {
          return await compressImage(workingFile);
        } catch {
          return workingFile;
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
