"use client";

import { useState, useEffect } from "react";
import { getContractPdf, verifyAccessCode } from "./actions";
import { Stage2Form } from "./Stage2Form";
import { UploadDocumentsForm } from "./UploadDocumentsForm";
import { RequestData } from "./types";
import { AddendumForm } from "./AddendumForm";

function getStep(
  status: string,
  hasInitialAddendum: boolean,
): number | "exception" {
  if (status === "rejected" || status === "overdue") return "exception";
  if (status === "submitted" || status === "reviewing") return 1;
  if (status === "contract_generated" || status === "documents_uploaded")
    return 2;
  if (status === "ready_to_pickup") return hasInitialAddendum ? 4 : 3;
  if (status === "active" || status === "returned") return 5;
  return 1;
}

const STEP_LABELS = [
  "Request Submitted",
  "Complete Data & Documents",
  "Instrument Pickup",
  "Fill Addendum",
  "Currently Borrowed",
];

function ProgressBar({
  status,
  hasInitialAddendum,
}: {
  status: string;
  hasInitialAddendum: boolean;
}) {
  const step = getStep(status, hasInitialAddendum);

  if (step === "exception") {
    return (
      <p style={{ color: status === "rejected" ? "red" : "orange" }}>
        {status === "rejected"
          ? "Request Rejected"
          : "Overdue — please return the instrument"}
      </p>
    );
  }

  return (
    <ol style={{ display: "flex", gap: "8px" }}>
      {STEP_LABELS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === step;
        const isDone = stepNumber < step;
        return (
          <li
            key={label}
            style={{
              fontWeight: isActive ? "bold" : "normal",
              opacity: isDone || isActive ? 1 : 0.4,
            }}
          >
            {stepNumber}. {label}
          </li>
        );
      })}
    </ol>
  );
}

export function StatusGate({ ticketId }: { ticketId: string }) {
  const [data, setData] = useState<RequestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  async function refetch() {
    const savedCode = localStorage.getItem(`access_code_${ticketId}`);
    if (!savedCode) return;

    const result = await verifyAccessCode(ticketId, savedCode);
    if (result.success) {
      setData(result.request);
    } else {
      localStorage.removeItem(`access_code_${ticketId}`);
      setData(null);
    }
  }

  useEffect(() => {
    refetch().finally(() => setChecking(false));
  }, [ticketId]);

  async function handleSubmit(formData: FormData) {
    const code = formData.get("code") as string;
    const result = await verifyAccessCode(ticketId, code);

    if (result.success) {
      localStorage.setItem(`access_code_${ticketId}`, code);
      setData(result.request);
      setError(null);
    } else {
      setError(result.error);
    }
  }

  if (checking) return <p>Loading...</p>;

  if (data) {
    if (data.status === "reviewing" && data.instrumentConfirmed) {
      return <Stage2Form ticketId={data.ticketId} onSuccess={refetch} />;
    }

    return (
      <div>
        <h1>Status for {data.borrowerName}</h1>
        <p>Ticket: {data.ticketId}</p>
        <p>Instrument Requested: {data.instrumentTypeRequested}</p>
        <ProgressBar
          status={data.status}
          hasInitialAddendum={data.hasInitialAddendum}
        />
        {data.status === "active" && data.dueDate && (
          <p>Due Date: {new Date(data.dueDate).toLocaleDateString("id-ID")}</p>
        )}
        {data.status === "contract_generated" && (
          <button
            onClick={async () => {
              const savedCode = localStorage.getItem(`access_code_${ticketId}`);
              if (!savedCode) return;

              const result = await getContractPdf(ticketId, savedCode);
              if (result.success) {
                const link = document.createElement("a");
                link.href = result.dataUrl;
                link.download = result.fileName;
                link.click();
              } else {
                alert(result.error);
              }
            }}
          >
            Download Contract
          </button>
        )}
        {data.status === "contract_generated" && (
          <UploadDocumentsForm ticketId={data.ticketId} />
        )}
        {data.status === "ready_to_pickup" && !data.hasInitialAddendum && (
          <AddendumForm ticketId={data.ticketId} onSuccess={refetch} />
        )}
      </div>
    );
  }

  return (
    <form action={handleSubmit}>
      <h1>Enter Access Code</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input name="code" type="text" placeholder="Access Code" required />
      <button type="submit">Unlock</button>
    </form>
  );
}
