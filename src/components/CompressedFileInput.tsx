"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { prepareImageFile } from "@/lib/files/image-processing";
import { toastError } from "@/lib/toast";

export function CompressedFileInput({
  id,
  name,
  accept,
  multiple = false,
  required = false,
  onCompressingChange,
  onCompressingProgress,
}: {
  id?: string;
  name: string;
  accept: string;
  multiple?: boolean;
  required?: boolean;
  onCompressingChange?: (isCompressing: boolean) => void;
  onCompressingProgress?: (current: number, total: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(
    null,
  );

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    onCompressingChange?.(true);

    const fileList = Array.from(files);
    const processed: File[] = [];
    for (const [index, file] of fileList.entries()) {
      setProgress({ current: index + 1, total: fileList.length });
      onCompressingProgress?.(index + 1, fileList.length);
      try {
        processed.push(await prepareImageFile(file));
      } catch {
        toastError(`Gagal memproses foto "${file.name}". Coba pilih ulang foto ini.`);
        if (inputRef.current) inputRef.current.value = "";
        setIsCompressing(false);
        onCompressingChange?.(false);
        setProgress(null);
        return;
      }
    }

    const dataTransfer = new DataTransfer();
    for (const file of processed) {
      dataTransfer.items.add(file);
    }
    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }

    setIsCompressing(false);
    onCompressingChange?.(false);
    setProgress(null);
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
        <p className="text-xs text-muted-foreground">
          {progress && progress.total > 1
            ? `Memproses foto ${progress.current} dari ${progress.total}...`
            : "Memproses foto..."}
        </p>
      )}
    </div>
  );
}
