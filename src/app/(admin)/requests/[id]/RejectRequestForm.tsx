"use client";

import { useActionState, useEffect } from "react";
import { rejectRequest, RejectRequestState } from "./actions";
import { toastError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Notice } from "@/components/Notice";
import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Field, useFocusFirstInvalid } from "@/components/Field";
import { submitWithoutReset } from "@/lib/submit-without-reset";

const initialState: RejectRequestState = {
  success: false,
  error: null,
  generalError: null,
};

export function RejectRequestForm({ requestId }: { requestId: string }) {
  const action = rejectRequest.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useFocusFirstInvalid(state.fieldErrors);

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
  }, [state]);

  return (
    <form
      ref={formRef}
      onSubmit={submitWithoutReset(formAction)}
      noValidate
      className="flex flex-col gap-4"
    >
      {state.error && (
        <Notice tone="danger" compact aria-live="polite">
          {state.error}
        </Notice>
      )}
      <Field label="Reason" error={state.fieldErrors?.reason}>
        {(control) => (
          <Textarea
            {...control}
            name="reason"
            placeholder="Reason for rejection"
            required
          />
        )}
      </Field>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Keep request</AlertDialogCancel>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? "Rejecting..." : "Reject request"}
        </Button>
      </AlertDialogFooter>
    </form>
  );
}
