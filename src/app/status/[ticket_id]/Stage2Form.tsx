"use client";

import { useActionState, useEffect } from "react";
import { submitStage2 } from "./actions";
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

export function Stage2Form({
  ticketId,
  accessCode,
  onSuccess,
}: {
  ticketId: string;
  accessCode: string;
  onSuccess: () => void;
}) {
  const action = submitStage2.bind(null, ticketId, accessCode);
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
        <CardTitle>Lengkapi data kontrak kamu</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          className="flex flex-col gap-4"
          key={JSON.stringify(state.fields)}
        >
          {state.error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {state.error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ktpNumber" required>
              Nomor KTP
            </Label>
            <Input
              id="ktpNumber"
              name="ktpNumber"
              type="text"
              inputMode="numeric"
              placeholder="16 digit"
              className="tabular"
              defaultValue={state.fields.ktpNumber ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressKtp" required>
              Alamat (sesuai KTP)
            </Label>
            <Input
              id="addressKtp"
              name="addressKtp"
              type="text"
              defaultValue={state.fields.addressKtp ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressDomicile" required>
              Alamat Domisili
            </Label>
            <Input
              id="addressDomicile"
              name="addressDomicile"
              type="text"
              defaultValue={state.fields.addressDomicile ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="faculty" required>
              Fakultas/Jurusan
            </Label>
            <Input
              id="faculty"
              name="faculty"
              type="text"
              placeholder="mis. FMIPA/Biologi"
              defaultValue={state.fields.faculty ?? ""}
              required
            />
          </div>

          <div className="mt-2 flex flex-col gap-4 border-t border-border pt-4">
            <h3 className="text-title text-foreground">Data Wali</h3>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guardianName" required>
                Nama Wali
              </Label>
              <Input
                id="guardianName"
                name="guardianName"
                type="text"
                defaultValue={state.fields.guardianName ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guardianPhone" required>
                Nomor HP Wali
              </Label>
              <Input
                id="guardianPhone"
                name="guardianPhone"
                type="tel"
                className="tabular"
                defaultValue={state.fields.guardianPhone ?? ""}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guardianAddressKtp" required>
                Alamat Wali (sesuai KTP)
              </Label>
              <Input
                id="guardianAddressKtp"
                name="guardianAddressKtp"
                type="text"
                defaultValue={state.fields.guardianAddressKtp ?? ""}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? "Memproses..." : "Buat Kontrak"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
