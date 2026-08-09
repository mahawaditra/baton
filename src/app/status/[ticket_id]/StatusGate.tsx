"use client";

import { useState, useEffect } from "react";
import { getContractPdf, verifyAccessCode } from "./actions";
import { Stage2Form } from "./Stage2Form";
import { UploadDocumentsForm } from "./UploadDocumentsForm";
import { RequestData } from "./types";
import { AddendumForm } from "./AddendumForm";
import { ExtendForm } from "./ExtendForm";

function getStep(
  status: string,
  instrumentConfirmed: boolean,
  hasInitialAddendum: boolean,
): number | "exception" {
  if (status === "rejected" || status === "overdue") return "exception";
  if (status === "submitted") return 1;
  if (status === "reviewing") return instrumentConfirmed ? 2 : 1; // 👈 dipecah
  if (status === "contract_generated" || status === "documents_uploaded")
    return 2;
  if (status === "ready_to_pickup") return 3;
  if (status === "active" || status === "returned") return 4;
  return 1;
}

const STEP_LABELS = [
  "Request Submitted",
  "Complete Data & Documents",
  "Pickup & Fill Addendum",
  "Currently Borrowed",
];

function ProgressBar({
  status,
  hasInitialAddendum,
  instrumentConfirmed,
}: {
  status: string;
  hasInitialAddendum: boolean;
  instrumentConfirmed: boolean;
}) {
  const step = getStep(status, instrumentConfirmed, hasInitialAddendum);

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
        const displayLabel =
          stepNumber === 4 && status === "returned" ? "Returned" : label;
        return (
          <li
            key={label}
            style={{
              fontWeight: isActive ? "bold" : "normal",
              opacity: isDone || isActive ? 1 : 0.4,
            }}
          >
            {stepNumber}. {displayLabel}
          </li>
        );
      })}
    </ol>
  );
}

export function StatusGate({ ticketId }: { ticketId: string }) {
  const [data, setData] = useState<RequestData | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  async function refetch() {
    const savedCode = localStorage.getItem(`access_code_${ticketId}`);
    if (!savedCode) return;

    const result = await verifyAccessCode(ticketId, savedCode);
    if (result.success) {
      setData(result.request);
      setAccessCode(savedCode);
    } else {
      localStorage.removeItem(`access_code_${ticketId}`);
      setData(null);
      setAccessCode(null);
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
      setAccessCode(code);
      setError(null);
    } else {
      setError(result.error);
    }
  }

  if (checking) return <p>Loading...</p>;

  if (data && accessCode) {
    return (
      <div>
        <h1>Status for {data.borrowerName}</h1>
        <p>Ticket: {data.ticketId}</p>
        <p>Instrument Requested: {data.instrumentTypeRequested}</p>
        <ProgressBar
          status={data.status}
          hasInitialAddendum={data.hasInitialAddendum}
          instrumentConfirmed={data.instrumentConfirmed}
        />
        {data.status === "reviewing" && data.instrumentConfirmed && (
          <Stage2Form
            ticketId={data.ticketId}
            accessCode={accessCode}
            onSuccess={refetch}
          />
        )}
        {data.status === "active" && data.dueDate && (
          <p>Due Date: {new Date(data.dueDate).toLocaleDateString("id-ID")}</p>
        )}
        {data.canExtend && !showExtendForm && (
          <button onClick={() => setShowExtendForm(true)}>Perpanjang</button>
        )}
        {(data.status === "active" || data.status === "overdue") &&
          data.hasInitialAddendum &&
          !data.hasFinalAddendum &&
          !showReturnForm && (
            <button onClick={() => setShowReturnForm(true)}>
              {data.canExtend ||
              !data.dueDate ||
              new Date(data.dueDate) < new Date()
                ? "Kembalikan"
                : "Kembalikan Lebih Awal"}
            </button>
          )}

        {(data.status === "active" || data.status === "overdue") &&
          data.hasFinalAddendum && (
            <p>
              Addendum pengembalian sudah dikirim. Menunggu admin konfirmasi
              pengembalian di Sekre.
            </p>
          )}
        {(data.status === "submitted" || data.status === "reviewing") &&
          !data.instrumentConfirmed && (
            <p>
              Admin sedang mereview pengajuan dan mengecek ketersediaan
              instrumen kamu.
            </p>
          )}

        {data.status === "documents_uploaded" && (
          <p>Dokumen kamu sedang direview admin.</p>
        )}

        {data.status === "ready_to_pickup" && data.hasInitialAddendum && (
          <p>Addendum sudah dikirim. Menunggu konfirmasi admin.</p>
        )}

        {data.isExtensionPeriod &&
          !data.needsExtensionDocuments &&
          !data.canFillExtensionAddendum &&
          !data.hasInitialAddendum && (
            <p>Dokumen perpanjangan sedang direview admin.</p>
          )}

        {showReturnForm && (
          <AddendumForm
            ticketId={data.ticketId}
            accessCode={accessCode}
            timing="final"
            onSuccess={() => {
              setShowReturnForm(false);
              refetch();
            }}
          />
        )}

        {showExtendForm && (
          <ExtendForm
            data={data}
            accessCode={accessCode}
            onSuccess={() => {
              setShowExtendForm(false);
              refetch();
            }}
          />
        )}
        {(data.status === "contract_generated" ||
          data.needsExtensionDocuments) && (
          <button
            onClick={async () => {
              const result = await getContractPdf(ticketId, accessCode);
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
        {(data.status === "contract_generated" ||
          data.needsExtensionDocuments) && (
          <UploadDocumentsForm
            ticketId={data.ticketId}
            accessCode={accessCode}
            isExtension={data.needsExtensionDocuments}
            onSuccess={refetch}
          />
        )}
        {((data.status === "ready_to_pickup" && !data.hasInitialAddendum) ||
          data.canFillExtensionAddendum) && (
          <AddendumForm
            ticketId={data.ticketId}
            accessCode={accessCode}
            onSuccess={refetch}
          />
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
