"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { ItemPhoto } from "@/components/ItemPhoto";
import { PhotoUploadModal } from "@/components/PhotoUploadModal";
import { cn } from "@/lib/utils";

export function ItemPhotoField({
  fileId,
  alt,
  action,
  className,
}: {
  fileId: string | null;
  alt: string;
  action: (formData: FormData) => Promise<void>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <ItemPhoto fileId={fileId} alt={alt} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={fileId ? "Replace photo" : "Add photo"}
        className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-colors hover:bg-muted"
      >
        <Camera className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <PhotoUploadModal open={open} onOpenChange={setOpen} action={action} />
    </div>
  );
}
