"use client";

import { useState, useEffect } from "react";
import { getContractPdf, verifyAccessCode } from "./actions";
import { Stage2Form } from "./Stage2Form";

type RequestData = {
  ticketId: string;
  borrowerName: string;
  status: string;
  instrumentTypeRequested: string;
  instrumentConfirmed: boolean;
};

const STEP_MAP: Record<string, number | "exception"> = {
  submitted: 1,
  reviewing: 1,
  contract_generated: 2,
  documents_uploaded: 2,
  ready_to_pickup: 3,
  active: 5,
  returned: 5,
  rejected: "exception",
  overdue: "exception",
};

const STEP_LABELS = [
  "Request Submitted",
  "Complete Data & Documents",
  "Instrument Pickup",
  "Fill Initial Condition",
  "Currently Borrowed",
];

function ProgressBar({ status }: { status: string }) {
  const step = STEP_MAP[status];

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

  useEffect(() => {
    const savedCode = localStorage.getItem(`access_code_${ticketId}`);
    if (!savedCode) {
      setChecking(false);
      return;
    }
    verifyAccessCode(ticketId, savedCode).then((result) => {
      if (result.success) {
        setData(result.request);
      } else {
        localStorage.removeItem(`access_code_${ticketId}`);
      }
      setChecking(false);
    });
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
      return <Stage2Form ticketId={data.ticketId} />;
    }

    return (
      <div>
        <h1>Status for {data.borrowerName}</h1>
        <p>Ticket: {data.ticketId}</p>
        <p>Instrument Requested: {data.instrumentTypeRequested}</p>
        <ProgressBar status={data.status} />
        {[
          "contract_generated",
          "documents_uploaded",
          "ready_to_pickup",
          "active",
        ].includes(data.status) && (
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
