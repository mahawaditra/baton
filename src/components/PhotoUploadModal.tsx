"use client";

import "react-easy-crop/react-easy-crop.css";
import { useState, useCallback, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { RotateCw } from "lucide-react";
import { getCroppedImg } from "@/lib/crop-image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toastError } from "@/lib/toast";

export function PhotoUploadModal({
  open,
  onOpenChange,
  action,
  initialImageSrc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: (formData: FormData) => Promise<void>;
  initialImageSrc?: string;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(
    initialImageSrc ?? null,
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area | null>(null);
  const [pending, startTransition] = useTransition();

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  function reset() {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setArea(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleUpload() {
    if (!imageSrc || !area) return;
    startTransition(async () => {
      try {
        const blob = await getCroppedImg(imageSrc, area, rotation);
        const formData = new FormData();
        formData.append(
          "photo",
          new File([blob], "photo.jpg", { type: "image/jpeg" }),
        );
        await action(formData);
        reset();
        onOpenChange(false);
      } catch {
        toastError("Couldn't upload the photo. Try again.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{imageSrc ? "Crop photo" : "Add photo"}</DialogTitle>
        </DialogHeader>

        {!imageSrc ? (
          <label className="flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground hover:bg-muted/70">
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            Pick an image
          </label>
        ) : (
          <>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={3 / 4}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                disableAutomaticStylesInjection
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
                aria-label="Zoom"
              />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                aria-label="Rotate 90 degrees"
              >
                <RotateCw />
              </Button>
            </div>
          </>
        )}

        <DialogFooter>
          {imageSrc && (
            <Button variant="outline" onClick={reset} disabled={pending}>
              Choose another
            </Button>
          )}
          <Button onClick={handleUpload} disabled={!area || pending}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
