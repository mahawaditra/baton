"use client";

import { useActionState, useEffect } from "react";
import { submitDocuments } from "./actions";

const initialState = {
  success: false,
  error: null,
};

export function UploadDocumentsForm({
  ticketId,
  isExtension = false,
  onSuccess,
}: {
  ticketId: string;
  isExtension?: boolean;
  onSuccess: () => void;
}) {
  const action = submitDocuments.bind(null, ticketId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  if (state.success) {
    return <p>Documents uploaded! Please wait for admin review.</p>;
  }

  return (
    <form action={formAction}>
      <h3>Upload Required Documents</h3>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}

      <label>
        Signed Contract
        <input
          name="signedContract"
          type="file"
          accept="image/*,.pdf"
          required
        />
      </label>

      {!isExtension && (
        <label>
          Deposit Transfer Proof
          <input name="depositProof" type="file" accept="image/*" required />
        </label>
      )}

      <label>
        KTP Scan {isExtension && "(optional — only if changed)"}
        <input
          name="ktpScan"
          type="file"
          accept="image/*,.pdf"
          required={!isExtension}
        />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? "Uploading..." : "Upload Documents"}
      </button>
    </form>
  );
}
