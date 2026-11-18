"use client";

import { useActionState, useEffect } from "react";
import { submitExtension } from "./actions";
import { RequestData } from "./types";
import { toastError } from "@/lib/toast";
import { withNetworkFallback } from "@/lib/network-fallback";
import { splitFacultyMajor } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/Notice";
import { useFocusFirstInvalid } from "@/components/Field";
import { ContractDataFields } from "./ContractDataFields";

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
  const action = withNetworkFallback(
    submitExtension.bind(null, data.ticketId, accessCode),
  );
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useFocusFirstInvalid(state.fieldErrors);
  const prefillFaculty = splitFacultyMajor(data.borrowerFaculty);
  const contractValues = {
    ktpNumber: state.fields.ktpNumber || data.borrowerKtpNumber || "",
    addressKtp: state.fields.addressKtp || data.borrowerAddressKtp || "",
    addressDomicile:
      state.fields.addressDomicile || data.borrowerAddressDomicile || "",
    faculty: state.fields.faculty || prefillFaculty.faculty || "",
    major: state.fields.major || prefillFaculty.major || "",
    guardianName: state.fields.guardianName || data.guardianName || "",
    guardianPhone: state.fields.guardianPhone || data.guardianPhone || "",
    guardianAddressKtp:
      state.fields.guardianAddressKtp || data.guardianAddressKtp || "",
  };

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perpanjang masa peminjaman</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-caption text-foreground-2">
          Cek ulang data kamu di bawah — ubah kalau ada yang berubah.
        </p>

        <form
          ref={formRef}
          action={formAction}
          noValidate
          key={JSON.stringify(state.fields)}
          className="flex flex-col gap-4"
        >
          {state.error && (
            <Notice tone="danger" compact aria-live="polite">
              {state.error}
            </Notice>
          )}

          <ContractDataFields
            values={contractValues}
            errors={state.fieldErrors ?? {}}
          />

          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? "Memproses..." : "Buat kontrak perpanjangan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
