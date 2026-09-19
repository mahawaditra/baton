"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { CompressedFileInput } from "@/components/CompressedFileInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_LABEL,
} from "@/lib/file-validation";
import { getDocumentTypeLabel } from "@/lib/loan-rules";
import { uploadSequentially, type UploadOutcome } from "@/lib/sequential-upload";
import { toastError } from "@/lib/toast";

export type DocumentType = "signed_contract" | "deposit_proof" | "ktp_scan";

type SlotConfig = {
  type: DocumentType;
  label: string;
  helperText?: string;
  accept: string;
  required: boolean;
};

function buildSlots(isExtension: boolean): SlotConfig[] {
  const compressionHint = `Foto otomatis dikompres, PDF tidak. Maks. ${MAX_UPLOAD_SIZE_LABEL}`;
  const slots: SlotConfig[] = [
    {
      type: "signed_contract",
      label: getDocumentTypeLabel("signed_contract"),
      helperText: compressionHint,
      accept: "image/*,.pdf",
      required: true,
    },
  ];
  if (!isExtension) {
    slots.push({
      type: "deposit_proof",
      label: getDocumentTypeLabel("deposit_proof"),
      accept: "image/*",
      required: true,
    });
  }
  slots.push({
    type: "ktp_scan",
    label: isExtension
      ? `${getDocumentTypeLabel("ktp_scan")} (opsional, cuma kalau ada perubahan)`
      : getDocumentTypeLabel("ktp_scan"),
    helperText: compressionHint,
    accept: "image/*,.pdf",
    required: !isExtension,
  });
  return slots;
}

export function DocumentUploadsPanel({
  isExtension,
  uploadedDocumentTypes,
  upload,
  onSuccess,
}: {
  isExtension: boolean;
  uploadedDocumentTypes: string[];
  upload: (type: DocumentType, file: File) => Promise<UploadOutcome>;
  onSuccess: () => void | Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [doneTypes, setDoneTypes] = useState<DocumentType[]>([]);
  const [errors, setErrors] = useState<Partial<Record<DocumentType, string>>>(
    {},
  );
  const [compressing, setCompressing] = useState<DocumentType[]>([]);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  const slots = buildSlots(isExtension);
  const isLocked = (type: DocumentType) =>
    uploadedDocumentTypes.includes(type) || doneTypes.includes(type);
  const openSlots = slots.filter((slot) => !isLocked(slot.type));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tooLarge: Partial<Record<DocumentType, string>> = {};
    const items = openSlots.flatMap((slot) => {
      const file = formData.get(slot.type);
      if (!(file instanceof File) || file.size === 0) return [];
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        tooLarge[slot.type] =
          `Ukuran file (${(file.size / (1024 * 1024)).toFixed(1)}MB) melebihi batas ${MAX_UPLOAD_SIZE_LABEL}. Perkecil dulu ukurannya.`;
        return [];
      }
      return [{ key: slot.type, file }];
    });

    setErrors(tooLarge);
    if (items.length === 0) return;
    setTotal(items.length);

    startTransition(async () => {
      const result = await uploadSequentially(items, upload, (key, outcome) => {
        setCompleted((current) => current + 1);
        if (outcome.success) setDoneTypes((current) => [...current, key]);
      });

      setErrors({ ...tooLarge, ...result.errors });
      setCompleted(0);
      if (result.generalError) toastError(result.generalError);
      if (result.succeeded.length > 0) {
        try {
          await onSuccess();
          setDoneTypes([]);
        } catch {
          toastError(
            "Upload berhasil tersimpan, tapi tampilan belum diperbarui. Muat ulang halaman ini.",
          );
        }
      }
    });
  }

  function setSlotCompressing(type: DocumentType, isCompressing: boolean) {
    setCompressing((current) =>
      isCompressing
        ? [...current.filter((t) => t !== type), type]
        : current.filter((t) => t !== type),
    );
  }

  function buttonLabel() {
    if (compressing.length > 0) return "Memproses...";
    if (isPending) {
      return total > 1
        ? `Mengupload ${Math.min(completed + 1, total)} dari ${total}...`
        : "Mengupload...";
    }
    return openSlots.length > 1 ? "Upload semua" : "Upload";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Dokumen yang Diperlukan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {slots.map((slot) =>
            isLocked(slot.type) ? (
              <div
                key={slot.type}
                className="flex items-center gap-2 text-sm text-success"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                {slot.label} sudah diupload
              </div>
            ) : (
              <div key={slot.type} className="flex flex-col gap-1.5">
                <Label htmlFor={slot.type} required={slot.required}>
                  {slot.label}
                </Label>
                {slot.helperText && (
                  <p className="text-caption text-muted-foreground">
                    {slot.helperText}
                  </p>
                )}
                <CompressedFileInput
                  id={slot.type}
                  name={slot.type}
                  accept={slot.accept}
                  required={slot.required}
                  onCompressingChange={(isCompressing) =>
                    setSlotCompressing(slot.type, isCompressing)
                  }
                />
                {errors[slot.type] && (
                  <p className="text-sm text-destructive" aria-live="polite">
                    {errors[slot.type]}
                  </p>
                )}
              </div>
            ),
          )}

          {openSlots.length > 0 && (
            <Button
              type="submit"
              disabled={isPending || compressing.length > 0}
              className="w-full"
            >
              {buttonLabel()}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
