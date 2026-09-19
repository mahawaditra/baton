"use client";

import { submitDocument } from "./actions";
import { DocumentUploadsPanel, type DocumentType } from "./DocumentUploadsPanel";

const initialState = {
  success: false,
  error: null,
  generalError: null,
};

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
  function upload(type: DocumentType, file: File) {
    const formData = new FormData();
    formData.set("file", file);
    return submitDocument(ticketId, accessCode, type, initialState, formData);
  }

  return (
    <DocumentUploadsPanel
      isExtension={isExtension}
      uploadedDocumentTypes={uploadedDocumentTypes}
      upload={upload}
      onSuccess={onSuccess}
    />
  );
}
