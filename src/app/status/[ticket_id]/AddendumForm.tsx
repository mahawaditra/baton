"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { submitAddendum } from "./actions";
import { CompressedFileInput } from "@/components/CompressedFileInput";
import {
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_LABEL,
  validateImageUpload,
} from "@/lib/files/file-validation";
import { toastError } from "@/lib/toast";
import { withNetworkFallback } from "@/lib/network-fallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, useFocusFirstInvalid } from "@/components/Field";
import type { FieldErrors } from "@/lib/form-errors";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { Notice } from "@/components/Notice";

const initialState = {
  success: false,
  error: null,
  generalError: null,
  fields: {},
};

export function AddendumForm({
  ticketId,
  accessCode,
  timing = "initial",
  onSuccess,
}: {
  ticketId: string;
  accessCode: string;
  timing?: "initial" | "final";
  onSuccess: () => void;
}) {
  const action = withNetworkFallback(
    submitAddendum.bind(null, ticketId, accessCode, timing),
  );
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const errors = useMemo(
    () => ({ ...state.fieldErrors, ...clientErrors }),
    [state.fieldErrors, clientErrors],
  );
  const formRef = useFocusFirstInvalid(errors);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
  }, [state]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const photos = formData
      .getAll("photos")
      .filter((photo): photo is File => photo instanceof File && photo.size > 0);

    const totalSize = photos.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_UPLOAD_SIZE_BYTES) {
      setClientErrors({
        photos: `Total ukuran semua foto (${(totalSize / (1024 * 1024)).toFixed(1)}MB) melebihi batas ${MAX_UPLOAD_SIZE_LABEL}. Kurangi jumlah atau ukuran foto.`,
      });
      return;
    }

    setIsValidating(true);
    for (const [index, photo] of photos.entries()) {
      const validation = await validateImageUpload(photo);
      if (!validation.valid) {
        setClientErrors({
          photos: `Foto ke-${index + 1} (${photo.name}): ${validation.error}`,
        });
        setIsValidating(false);
        return;
      }
    }
    setIsValidating(false);

    setClientErrors({});
    startTransition(() => {
      formAction(formData);
    });
  }

  if (state.success) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3">
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-success"
            strokeWidth={1.75}
          />
          <p className="text-body text-foreground-2">
            {timing === "initial"
              ? "Addendum terkirim! Peminjaman kamu lagi difinalisasi staf."
              : "Addendum terkirim! Bawa instrumennya ke Sekre biar staf cek kondisinya dan konfirmasi pengembalian."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {timing === "initial"
            ? "Addendum kondisi awal"
            : "Addendum kondisi akhir (pengembalian)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timing === "initial" && (
          <p className="mb-4 text-caption text-foreground-2">
            Sebelum atau saat mengisi form ini, pastikan kamu sudah koordinasi
            jadwal pengambilan instrumen dengan staf Logistik OSUI (bisa dicek
            lewat email).
          </p>
        )}

        <form
          ref={formRef}
          action={formAction}
          onSubmit={handleSubmit}
          noValidate
          key={JSON.stringify(state.fields)}
          className="flex flex-col gap-4"
        >
          {state.error && (
            <Notice tone="danger" compact aria-live="polite">
              {state.error}
            </Notice>
          )}

          <Field
            label="Kelengkapan (bow, case, rosin, dll.)"
            error={errors.completeness}
          >
            {(control) => (
              <Input
                {...control}
                name="completeness"
                type="text"
                maxLength={500}
                defaultValue={state.fields.completeness ?? ""}
                required
              />
            )}
          </Field>
          <Field label="Kondisi badan alat" error={errors.bodyCondition}>
            {(control) => (
              <Textarea
                {...control}
                name="bodyCondition"
                maxLength={1000}
                defaultValue={state.fields.bodyCondition ?? ""}
                required
              />
            )}
          </Field>
          <Field
            label="Kondisi aksesori"
            optional
            error={errors.accessoriesCondition}
          >
            {(control) => (
              <Textarea
                {...control}
                name="accessoriesCondition"
                maxLength={1000}
                defaultValue={state.fields.accessoriesCondition ?? ""}
              />
            )}
          </Field>
          <Field label="Catatan" optional error={errors.notes}>
            {(control) => (
              <Textarea
                {...control}
                name="notes"
                maxLength={1000}
                defaultValue={state.fields.notes ?? ""}
              />
            )}
          </Field>
          <Field label="Foto kondisi" error={errors.photos}>
            {(control) => (
              <CompressedFileInput
                {...control}
                name="photos"
                accept="image/*"
                multiple
                required
                onCompressingChange={setIsCompressing}
                onCompressingProgress={(current, total) =>
                  setCompressProgress({ current, total })
                }
              />
            )}
          </Field>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="confirmedTruthful"
                name="confirmedTruthful"
                required
                aria-invalid={errors.confirmedTruthful ? true : undefined}
                aria-describedby={
                  errors.confirmedTruthful
                    ? "confirmedTruthful-error"
                    : undefined
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="confirmedTruthful"
                className="font-normal text-foreground-2"
              >
                Saya konfirmasi data kondisi di atas benar adanya dan sesuai dengan kenyataan.
              </Label>
            </div>
            {errors.confirmedTruthful && (
              <FieldError id="confirmedTruthful-error">
                {errors.confirmedTruthful}
              </FieldError>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || isCompressing || isValidating}
            className="self-start"
          >
            {isCompressing
              ? compressProgress && compressProgress.total > 1
                ? `Memproses foto ${compressProgress.current} dari ${compressProgress.total}...`
                : "Memproses..."
              : isValidating
                ? "Memeriksa foto..."
                : isPending
                  ? "Mengirim..."
                  : "Kirim addendum"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
