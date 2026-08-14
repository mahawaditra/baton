"use client";

import { useActionState, useEffect } from "react";
import { submitDocuments } from "./actions";
import { CompressedFileInput } from "@/components/CompressedFileInput";
import { MAX_UPLOAD_SIZE_LABEL } from "@/lib/file-validation";

const initialState = {
  success: false,
  error: null,
};

export function UploadDocumentsForm({
  ticketId,
  accessCode,
  isExtension = false,
  documentsNeedingUpload,
  onSuccess,
}: {
  ticketId: string;
  accessCode: string;
  isExtension?: boolean;
  documentsNeedingUpload: string[];
  onSuccess: () => void;
}) {
  const action = submitDocuments.bind(null, ticketId, accessCode);
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  if (state.success) {
    return <p>Documents uploaded! Please wait for admin review.</p>;
  }

  const needsSignedContract =
    isExtension || documentsNeedingUpload.includes("signed_contract");
  const needsDepositProof =
    !isExtension && documentsNeedingUpload.includes("deposit_proof");
  const needsKtpScan =
    isExtension || documentsNeedingUpload.includes("ktp_scan");

  return (
    <form action={formAction}>
      <h3>Upload Required Documents</h3>
      {state.error && <p style={{ color: "red" }}>{state.error}</p>}

      {needsSignedContract && (
        <label>
          Signed Contract (photos are compressed automatically — PDFs are
          not, max {MAX_UPLOAD_SIZE_LABEL})
          <CompressedFileInput
            name="signedContract"
            accept="image/*,.pdf"
            required
          />
        </label>
      )}

      {needsDepositProof && (
        <label>
          Deposit Transfer Proof
          <CompressedFileInput
            name="depositProof"
            accept="image/*"
            required
          />
        </label>
      )}

      {needsKtpScan && (
        <label>
          KTP Scan {isExtension && "(optional — only if changed)"} (photos
          are compressed automatically — PDFs are not, max{" "}
          {MAX_UPLOAD_SIZE_LABEL})
          <CompressedFileInput
            name="ktpScan"
            accept="image/*,.pdf"
            required={!isExtension}
          />
        </label>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Uploading..." : "Upload Documents"}
      </button>
    </form>
  );
}
