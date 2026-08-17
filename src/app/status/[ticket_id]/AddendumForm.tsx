"use client";

import { useActionState, useEffect, useState } from "react";
import { submitAddendum } from "./actions";
import { CompressedFileInput } from "@/components/CompressedFileInput";
import {
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_LABEL,
} from "@/lib/file-validation";
import { toastError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";

const initialState = {
  success: false,
  error: null,
  generalError: null,
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
  const action = submitAddendum.bind(null, ticketId, accessCode, timing);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [totalSizeError, setTotalSizeError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
  }, [state.generalError]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const photos = new FormData(e.currentTarget).getAll("photos") as File[];
    const totalSize = photos.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > MAX_UPLOAD_SIZE_BYTES) {
      e.preventDefault();
      setTotalSizeError(
        `Total ukuran semua foto (${(totalSize / (1024 * 1024)).toFixed(1)}MB) melebihi batas ${MAX_UPLOAD_SIZE_LABEL}. Kurangi jumlah atau ukuran foto.`,
      );
      return;
    }

    setTotalSizeError(null);
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
              ? "Addendum terkirim! Peminjaman kamu lagi difinalisasi admin."
              : "Addendum terkirim! Bawa instrumennya ke Sekre biar admin cek kondisinya dan konfirmasi pengembalian."}
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
            ? "Addendum Kondisi Awal"
            : "Addendum Kondisi Akhir (Pengembalian)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timing === "initial" && (
          <p className="mb-4 text-caption text-muted-foreground">
            Sebelum atau saat mengisi form ini, pastikan kamu sudah koordinasi
            jadwal pengambilan instrumen dengan staf Logistik OSUI (bisa dicek
            lewat email).
          </p>
        )}

        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {(totalSizeError ?? state.error) && (
            <p className="text-sm text-destructive" aria-live="polite">
              {totalSizeError ?? state.error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="completeness" required>
              Kelengkapan (bow, case, rosin, dll.)
            </Label>
            <Input id="completeness" name="completeness" type="text" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bodyCondition" required>
              Kondisi Badan Alat
            </Label>
            <Textarea id="bodyCondition" name="bodyCondition" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accessoriesCondition">Kondisi Aksesori</Label>
            <Textarea id="accessoriesCondition" name="accessoriesCondition" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photos" required>
              Foto Kondisi
            </Label>
            <CompressedFileInput
              id="photos"
              name="photos"
              accept="image/*"
              multiple
              required
              onCompressingChange={setIsCompressing}
            />
          </div>
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirmedTruthful"
              name="confirmedTruthful"
              required
              className="mt-0.5"
            />
            <Label
              htmlFor="confirmedTruthful"
              required
              className="font-normal text-foreground-2"
            >
              Saya konfirmasi data kondisi di atas benar adanya.
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isPending || isCompressing}
            className="self-start"
          >
            {isCompressing
              ? "Memproses..."
              : isPending
                ? "Mengirim..."
                : "Kirim Addendum"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
