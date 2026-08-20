"use client";

import { useActionState, useEffect } from "react";
import { submitExtension } from "./actions";
import { RequestData } from "./types";
import { toastError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  success: false,
  error: null,
  generalError: null,
  fields: {},
};

export function ExtendForm({
  data,
  accessCode,
  onSuccess,
}: {
  data: RequestData;
  accessCode: string;
  onSuccess: () => void;
}) {
  const action = submitExtension.bind(null, data.ticketId, accessCode);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
  }, [state.generalError]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perpanjang masa peminjaman</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-caption text-muted-foreground">
          Cek ulang data kamu di bawah — ubah kalau ada yang berubah.
        </p>

        <form
          action={formAction}
          key={JSON.stringify(state.fields)}
          className="flex flex-col gap-4"
        >
          {state.error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {state.error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ext-ktpNumber" required>
              Nomor KTP
            </Label>
            <Input
              id="ext-ktpNumber"
              name="ktpNumber"
              type="text"
              inputMode="numeric"
              className="tabular"
              defaultValue={state.fields.ktpNumber || data.borrowerKtpNumber || ""}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ext-addressKtp" required>
              Alamat (sesuai KTP)
            </Label>
            <Input
              id="ext-addressKtp"
              name="addressKtp"
              type="text"
              defaultValue={
                state.fields.addressKtp || data.borrowerAddressKtp || ""
              }
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ext-addressDomicile" required>
              Alamat Domisili
            </Label>
            <Input
              id="ext-addressDomicile"
              name="addressDomicile"
              type="text"
              defaultValue={
                state.fields.addressDomicile ||
                data.borrowerAddressDomicile ||
                ""
              }
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ext-faculty" required>
              Fakultas/Jurusan
            </Label>
            <Input
              id="ext-faculty"
              name="faculty"
              type="text"
              defaultValue={state.fields.faculty || data.borrowerFaculty || ""}
              required
            />
          </div>

          <div className="mt-2 flex flex-col gap-4 border-t border-border pt-4">
            <h3 className="text-title text-foreground">Data Wali</h3>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ext-guardianName" required>
                Nama Wali
              </Label>
              <Input
                id="ext-guardianName"
                name="guardianName"
                type="text"
                defaultValue={
                  state.fields.guardianName || data.guardianName || ""
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ext-guardianPhone" required>
                Nomor HP Wali
              </Label>
              <Input
                id="ext-guardianPhone"
                name="guardianPhone"
                type="tel"
                className="tabular"
                defaultValue={
                  state.fields.guardianPhone || data.guardianPhone || ""
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ext-guardianAddressKtp" required>
                Alamat Wali (sesuai KTP)
              </Label>
              <Input
                id="ext-guardianAddressKtp"
                name="guardianAddressKtp"
                type="text"
                defaultValue={
                  state.fields.guardianAddressKtp ||
                  data.guardianAddressKtp ||
                  ""
                }
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? "Memproses..." : "Buat Kontrak Perpanjangan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
