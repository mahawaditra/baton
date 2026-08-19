"use client";

import { useActionState, useEffect, useState } from "react";
import { submitDocument } from "./actions";
import { CompressedFileInput } from "@/components/CompressedFileInput";
import { MAX_UPLOAD_SIZE_LABEL } from "@/lib/file-validation";
import { getDocumentTypeLabel } from "@/lib/loan-rules";
import { toastError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

const initialState = {
  success: false,
  error: null,
  generalError: null,
};

type DocumentType = "signed_contract" | "deposit_proof" | "ktp_scan";

function DocumentUploadSlot({
  ticketId,
  accessCode,
  documentType,
  label,
  helperText,
  accept,
  required,
  uploaded,
  onUploaded,
}: {
  ticketId: string;
  accessCode: string;
  documentType: DocumentType;
  label: string;
  helperText?: string;
  accept: string;
  required: boolean;
  uploaded: boolean;
  onUploaded: () => void;
}) {
  const action = submitDocument.bind(null, ticketId, accessCode, documentType);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (state.success) onUploaded();
  }, [state.success, onUploaded]);

  useEffect(() => {
    if (state.generalError) toastError(state.generalError);
  }, [state.generalError]);

  const isLocked = uploaded || state.success;

  if (isLocked) {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        {label} sudah diupload
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <Label htmlFor={documentType} required={required}>
        {label}
      </Label>
      {helperText && (
        <p className="text-caption text-muted-foreground">{helperText}</p>
      )}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <CompressedFileInput
            id={documentType}
            name="file"
            accept={accept}
            required={required}
            onCompressingChange={setIsCompressing}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isPending || isCompressing}
          className="shrink-0"
        >
          {isCompressing
            ? "Memproses..."
            : isPending
              ? "Mengupload..."
              : "Upload"}
        </Button>
      </div>
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function UploadDocumentsForm({
  ticketId,
  accessCode,
  isExtension = false,
  uploadedDocumentTypes,
  onSuccess,
}: {
  ticketId: string;
  accessCode: string;
  isExtension?: boolean;
  uploadedDocumentTypes: string[];
  onSuccess: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Dokumen yang Diperlukan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <DocumentUploadSlot
          ticketId={ticketId}
          accessCode={accessCode}
          documentType="signed_contract"
          label={getDocumentTypeLabel("signed_contract")}
          helperText={`Foto otomatis dikompres, PDF tidak. Maks. ${MAX_UPLOAD_SIZE_LABEL}`}
          accept="image/*,.pdf"
          required
          uploaded={uploadedDocumentTypes.includes("signed_contract")}
          onUploaded={onSuccess}
        />

        {!isExtension && (
          <DocumentUploadSlot
            ticketId={ticketId}
            accessCode={accessCode}
            documentType="deposit_proof"
            label={getDocumentTypeLabel("deposit_proof")}
            accept="image/*"
            required
            uploaded={uploadedDocumentTypes.includes("deposit_proof")}
            onUploaded={onSuccess}
          />
        )}

        <DocumentUploadSlot
          ticketId={ticketId}
          accessCode={accessCode}
          documentType="ktp_scan"
          label={
            isExtension
              ? `${getDocumentTypeLabel("ktp_scan")} (opsional, cuma kalau ada perubahan)`
              : getDocumentTypeLabel("ktp_scan")
          }
          helperText={`Foto otomatis dikompres, PDF tidak. Maks. ${MAX_UPLOAD_SIZE_LABEL}`}
          accept="image/*,.pdf"
          required={!isExtension}
          uploaded={uploadedDocumentTypes.includes("ktp_scan")}
          onUploaded={onSuccess}
        />
      </CardContent>
    </Card>
  );
}
