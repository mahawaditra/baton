"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, ChevronLeft, ChevronRight, ImageOff, Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhotoUploadModal } from "@/components/PhotoUploadModal";
import { MARQUEE_TEXT } from "@/lib/constants";

const SKELETON_ROWS = 6;

function MarqueeSkeleton() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-hero-bg py-4"
    >
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <div key={i} className="overflow-hidden">
          <div
            className={`marquee-track ${i % 2 === 0 ? "marquee-l" : "marquee-r"} font-heading text-[clamp(1.75rem,7vw,3rem)] leading-none font-bold text-hero-fg/25 dark:text-gold/28`}
            style={{ animationDelay: `${-(i * 40) / SKELETON_ROWS}s` }}
          >
            <span>{MARQUEE_TEXT}</span>
            <span>{MARQUEE_TEXT}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhotoFrame({ fileId, alt }: { fileId: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  return (
    <div className="relative h-[60vh] w-full overflow-hidden rounded-md bg-muted">
      {status === "loading" && <MarqueeSkeleton />}

      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <ImageOff className="h-6 w-6" strokeWidth={1.75} />
          Photo failed to load
        </div>
      ) : (
        <Image
          src={`/admin/drive-files/${fileId}`}
          alt={alt}
          fill
          unoptimized
          className="object-contain"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  );
}

export function PhotoViewerModal({
  fileIds,
  title,
  uploadAction,
}: {
  fileIds: string[];
  title: string;
  uploadAction?: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [cropFileId, setCropFileId] = useState<string | null>(null);
  const count = fileIds.length;

  if (count === 0) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setIndex(0);
        }}
      >
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <ImageIcon />
          {count > 1 ? `View ${count} photos` : "View photo"}
        </DialogTrigger>

        <DialogContent className="gap-4 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <PhotoFrame
            key={fileIds[index]}
            fileId={fileIds[index]}
            alt={`${title} — ${index + 1}`}
          />

          {count > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous photo"
                onClick={() => setIndex((i) => (i - 1 + count) % count)}
              >
                <ChevronLeft />
              </Button>
              <span className="text-sm text-muted-foreground">
                Photo {index + 1} of {count}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next photo"
                onClick={() => setIndex((i) => (i + 1) % count)}
              >
                <ChevronRight />
              </Button>
            </div>
          )}

          {uploadAction && (
            <Button
              variant="outline"
              onClick={() => {
                setCropFileId(fileIds[index]);
                setOpen(false);
              }}
            >
              <Camera />
              Use as instrument photo
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {uploadAction && (
        <PhotoUploadModal
          key={cropFileId ?? "none"}
          open={cropFileId !== null}
          onOpenChange={(next) => {
            if (!next) setCropFileId(null);
          }}
          action={uploadAction}
          initialImageSrc={
            cropFileId ? `/admin/drive-files/${cropFileId}` : undefined
          }
        />
      )}
    </>
  );
}
