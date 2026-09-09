import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ItemPhoto({
  fileId,
  alt,
  className,
}: {
  fileId: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border bg-muted",
        className,
      )}
    >
      {fileId ? (
        <Image
          src={`/admin/drive-files/${fileId}`}
          alt={alt}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
          <ImageOff className="h-7 w-7" strokeWidth={1.5} />
          <span className="text-caption">No photo</span>
        </div>
      )}
    </div>
  );
}
