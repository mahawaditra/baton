"use client";

import { useRef, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { handoverKetua } from "./actions";
import { handoverDescription, handoverTitle } from "@/lib/admin/handover";
import { toastError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { HoldButton } from "@/components/HoldButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function HandoverButton({ staffCount }: { staffCount: number }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const result = await handoverKetua(formData);
        if (result.error) setError(result.error);
      } catch (err) {
        unstable_rethrow(err);
        toastError("Couldn't complete the handover. Try again.");
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        if (!next) setError(null);
        setOpen(next);
      }}
    >
      <AlertDialogTrigger render={<Button variant="outline" size="xs" />}>
        Handover
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[480px]">
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-6">
          <AlertDialogHeader>
            <AlertDialogTitle>{handoverTitle(staffCount)}</AlertDialogTitle>
            <AlertDialogDescription>
              {handoverDescription(staffCount)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-3">
            {error && (
              <p className="text-sm text-destructive" aria-live="polite">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="handoverEmail">Email</Label>
              <Input
                id="handoverEmail"
                name="email"
                type="email"
                placeholder="New Ketua email"
                required
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="handoverName">Name</Label>
              <Input
                id="handoverName"
                name="name"
                type="text"
                placeholder="New Ketua name"
                required
                disabled={pending}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              No! I&apos;m still attached!
            </AlertDialogCancel>
            <HoldButton
              label="Hold to sacrifice"
              holdingLabel="Keep holding..."
              pendingLabel="Sacrificing..."
              pending={pending}
              canStart={() => formRef.current?.reportValidity() ?? false}
              onConfirm={() => formRef.current?.requestSubmit()}
            />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
