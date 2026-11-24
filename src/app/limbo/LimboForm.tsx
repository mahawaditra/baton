"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { unstable_rethrow } from "next/navigation";
import { Camera } from "lucide-react";
import { completeHandover } from "./actions";
import { prepareImageFile } from "@/lib/files/image-processing";
import { toastError } from "@/lib/toast";
import { HoldButton } from "@/components/HoldButton";
import { cn } from "@/lib/utils";
import { Notice } from "@/components/Notice";
import { useSetLimboMood } from "./LimboShell";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

export function LimboForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [holding, setHolding] = useState(false);
  const holdRef = useRef<HTMLDivElement>(null);
  const setMood = useSetLimboMood();

  useEffect(() => {
    setMood(pending ? "farewell" : holding ? "holding" : "idle");
  }, [pending, holding, setMood]);

  function handleHoldChange(nextHolding: boolean) {
    const rect = holdRef.current?.getBoundingClientRect();
    if (nextHolding && rect) {
      setMood("holding", {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    setHolding(nextHolding);
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    setProcessing(true);
    setError(null);
    try {
      const prepared = await prepareImageFile(picked);
      if (!ACCEPTED_TYPES.includes(prepared.type)) {
        setError("Couldn't read that photo. Try a JPEG, PNG, or HEIC image.");
        return;
      }
      setFile(prepared);
      setPreviewUrl(URL.createObjectURL(prepared));
    } catch {
      toastError("Couldn't read that photo. Try another one.");
    } finally {
      setProcessing(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    setError(null);
    startTransition(async () => {
      try {
        const result = await completeHandover(formData);
        if (result.error) {
          setError(result.error);
          setHolding(false);
        }
      } catch (err) {
        unstable_rethrow(err);
        setHolding(false);
        toastError("Couldn't finish the handover. Try again.");
      }
    });
  }

  const busy = processing || pending;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-5"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={handlePick}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={
          previewUrl ? "Choose a different photo" : "Attach your soul"
        }
        className={cn(
          "relative flex aspect-square w-56 items-center justify-center overflow-hidden rounded-2xl bg-muted transition-colors sm:w-[clamp(10rem,calc(100svh-37.5rem),16rem)]",
          previewUrl
            ? "border-2 border-gold/70"
            : "border-2 border-dashed border-gold/40 hover:bg-muted/70",
          busy && "cursor-(--cursor-unavailable) opacity-60",
        )}
      >
        {previewUrl ? (
          <Image
            key={previewUrl}
            src={previewUrl}
            alt="Your photo"
            fill
            unoptimized
            className="limbo-develop object-cover"
          />
        ) : (
          <span className="flex flex-col items-center gap-2 text-muted-foreground">
            <Camera className="h-8 w-8" strokeWidth={1.5} />
            <span className="text-body">Attach your soul</span>
          </span>
        )}
      </button>

      {processing && (
        <p className="text-caption text-muted-foreground">
          Processing photo...
        </p>
      )}
      {previewUrl && !processing && (
        <p className="text-caption text-muted-foreground">
          Click again if you wish to switch for another part of your soul.
        </p>
      )}
      {error && (
        <Notice tone="danger" compact aria-live="polite">
          {error}
        </Notice>
      )}

      <div ref={holdRef}>
        <HoldButton
          label="Hold to sacrifice yourself"
          holdingLabel="Keep holding..."
          pendingLabel="Goodbye..."
          pending={pending}
          disabled={!file || processing}
          size="lg"
          className="min-w-64"
          onHoldChange={handleHoldChange}
          onConfirm={() => formRef.current?.requestSubmit()}
        />
      </div>
    </form>
  );
}
