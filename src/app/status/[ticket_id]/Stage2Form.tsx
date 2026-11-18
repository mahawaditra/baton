"use client";

import { useActionState, useEffect } from "react";
import { submitStage2 } from "./actions";
import { toastError } from "@/lib/toast";
import { withNetworkFallback } from "@/lib/network-fallback";
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

export function Stage2Form({
  ticketId,
  accessCode,
  onSuccess,
}: {
  ticketId: string;
  accessCode: string;
  onSuccess: () => void;
}) {
  const action = withNetworkFallback(
    submitStage2.bind(null, ticketId, accessCode),
  );
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useFocusFirstInvalid(state.fieldErrors);

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
        <CardTitle>Lengkapi data kontrak kamu</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
          noValidate
          className="flex flex-col gap-4"
          key={JSON.stringify(state.fields)}
        >
          {state.error && (
            <Notice tone="danger" compact aria-live="polite">
              {state.error}
            </Notice>
          )}

          <ContractDataFields
            values={state.fields}
            errors={state.fieldErrors ?? {}}
          />

          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? "Memproses..." : "Buat kontrak"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
