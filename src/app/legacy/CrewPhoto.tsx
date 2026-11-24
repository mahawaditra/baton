"use client";

import { ChromaticImage } from "@/components/ui/chromatic-image";
import { cn } from "@/lib/utils";
import { crewPhotoSrc, useOpenCrewPhoto } from "./CrewGallery";

export function CrewPhoto({
  slug,
  name,
  hasPhoto,
  featured,
  className,
  eager,
  unoptimized,
}: {
  slug: string;
  name: string;
  hasPhoto: boolean;
  featured?: boolean;
  className?: string;
  eager?: boolean;
  unoptimized?: boolean;
}) {
  const openPhoto = useOpenCrewPhoto();
  const src = crewPhotoSrc(slug);
  const radius = featured ? "rounded-3xl" : "rounded-2xl";
  const sizes = featured
    ? "(min-width: 1536px) 240px, (min-width: 640px) 192px, 176px"
    : "(min-width: 1536px) 112px, 96px";

  return (
    <div
      className={cn("gold-hairline shrink-0 shadow-sm", radius, className)}
    >
      <div
        data-crew-thumb={slug}
        className={cn(
          "relative h-full w-full overflow-hidden bg-muted",
          radius,
        )}
      >
        {hasPhoto ? (
          <button
            type="button"
            aria-label={`View ${name}'s photo`}
            onClick={() => openPhoto(slug)}
            className={cn(
              "absolute inset-0 block cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
              radius,
            )}
          >
            <ChromaticImage
              src={src}
              alt={name}
              className="h-full w-full"
              eager={eager}
              unoptimized={unoptimized}
              sizes={sizes}
            />
          </button>
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
