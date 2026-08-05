"use client";

import { useActionState } from "react";
import { submitDocuments } from "./actions";

const initialState = {
  success: false,
  error: null,
};

export function UploadDocumentsForm({ ticketId }: { ticketId: string }) {
  const action = submitDocuments.bind(null, ticketId);
  const [state, formAction, isPending] = useActionState(action, initialState);

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
      <label>
        Deposit Transfer Proof
        <input name="depositProof" type="file" accept="image/*" required />
      </label>
      <label>
        KTP Scan
        <input name="ktpScan" type="file" accept="image/*,.pdf" required />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? "Uploading..." : "Upload Documents"}
      </button>
    </form>
  );
}
