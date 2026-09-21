"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChromaticImage } from "@/components/ui/chromatic-image";
import { fitWithin } from "@/lib/legacy/legacy";
import { cn } from "@/lib/utils";

const MODAL_MAX_WIDTH_PX = 672;
const MODAL_MAX_UPSCALE = 1.6;

function CrewPhotoModal({ src, name }: { src: string; name: string }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/85 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
      <DialogPrimitive.Popup className="dark fixed top-1/2 left-1/2 z-50 w-max -translate-x-1/2 -translate-y-1/2 outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
        <DialogPrimitive.Title className="sr-only">{name}</DialogPrimitive.Title>
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gold/30 blur-3xl"
          />
          <Image
            src={src}
            alt={name}
            width={0}
            height={0}
            unoptimized
            onLoad={(event) => {
              const image = event.currentTarget;
              setSize(
                fitWithin({
                  naturalWidth: image.naturalWidth,
                  naturalHeight: image.naturalHeight,
                  maxWidth: Math.min(window.innerWidth * 0.88, MODAL_MAX_WIDTH_PX),
                  maxHeight: window.innerHeight * 0.8,
                  maxUpscale: MODAL_MAX_UPSCALE,
                }),
              );
            }}
            style={size ?? undefined}
            className={cn(
              "block rounded-2xl shadow-2xl transition-opacity duration-200",
              size ? "opacity-100" : "opacity-0",
            )}
          />
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white ring-1 ring-white/30 transition-colors outline-none hover:bg-black focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </DialogPrimitive.Close>
        </div>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

export function CrewPhoto({
  slug,
  name,
  hasPhoto,
  featured,
  className,
}: {
  slug: string;
  name: string;
  hasPhoto: boolean;
  featured?: boolean;
  className?: string;
}) {
  const src = `/legacy/photo/crew/${slug}`;
  const innerRadius = featured
    ? "rounded-[calc(1.5rem-1.5px)]"
    : "rounded-[calc(1rem-1.5px)]";

  return (
    <div
      className={cn(
        "shrink-0 bg-linear-to-b from-gold/80 via-gold/25 to-gold/60 p-[1.5px] shadow-sm",
        featured ? "rounded-3xl" : "rounded-2xl",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden bg-muted",
          innerRadius,
        )}
      >
        {hasPhoto ? (
          <DialogPrimitive.Root>
            <DialogPrimitive.Trigger
              aria-label={`View ${name}'s photo`}
              className={cn(
                "absolute inset-0 block cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                innerRadius,
              )}
            >
              <ChromaticImage src={src} alt={name} className="h-full w-full" />
            </DialogPrimitive.Trigger>
            <CrewPhotoModal src={src} name={name} />
          </DialogPrimitive.Root>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center font-heading text-h2 text-muted-foreground"
          >
            {name.charAt(0)}
          </div>
        )}
        {featured && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-2 rounded-2xl border border-gold/35"
          />
        )}
      </div>
    </div>
  );
}
