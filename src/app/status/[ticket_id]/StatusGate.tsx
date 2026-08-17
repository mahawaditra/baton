"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getContractPdf, verifyAccessCode } from "./actions";
import { Stage2Form } from "./Stage2Form";
import { UploadDocumentsForm } from "./UploadDocumentsForm";
import { RequestData } from "./types";
import { AddendumForm } from "./AddendumForm";
import { ExtendForm } from "./ExtendForm";
import { getRequestStep, LOAN_STEP_LABELS } from "@/lib/loan-rules";
import { toastError } from "@/lib/toast";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { LoanStepper } from "@/components/LoanStepper";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Download, Info } from "lucide-react";
import { cn } from "@/lib/utils";

function StatusNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gold/40 bg-gold-soft/40 p-4 text-sm">
      <Info
        className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft-foreground"
        strokeWidth={1.75}
      />
      <div className="text-foreground-2">{children}</div>
    </div>
  );
}

export function StatusGate({ ticketId }: { ticketId: string }) {
  const [data, setData] = useState<RequestData | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
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
    } else {
      toastError(result.error);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-body text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (data && accessCode) {
    const step = getRequestStep(data.status, data.instrumentConfirmed);
    const stepLabels = LOAN_STEP_LABELS.map((label, index) =>
      index === 3 && data.status === "returned" ? "Selesai" : label,
    );

    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12 md:py-16">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <RequestStatusBadge status={data.status} variant="pill" />
              <span className="tabular text-xs text-muted-foreground">
                Diajukan {new Date(data.createdAt).toLocaleDateString("en-GB")}
              </span>
            </div>
            <h1 className="font-heading text-h1 text-foreground">
              {data.borrowerName}{" "}
              <span className="tabular text-muted-foreground">
                — {data.ticketId}
              </span>
            </h1>
            <p className="mt-1 text-body text-muted-foreground">
              {data.instrumentTypeRequested}
            </p>
          </div>

          {step === "exception" ? (
            <div
              className={cn(
                "flex items-start gap-3 rounded-md border p-4 text-sm",
                data.status === "cancelled"
                  ? "border-border bg-muted/40"
                  : "border-destructive/40 bg-destructive-soft/40",
              )}
            >
              {data.status === "cancelled" ? (
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
              ) : (
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                  strokeWidth={1.75}
                />
              )}
              <div>
                <div
                  className={cn(
                    "font-semibold",
                    data.status === "cancelled"
                      ? "text-foreground"
                      : "text-destructive",
                  )}
                >
                  {data.status === "rejected"
                    ? "Pengajuan Ditolak"
                    : data.status === "cancelled"
                      ? "Pengajuan Dibatalkan"
                      : "Terlambat"}
                </div>
                {data.status === "rejected" && data.rejectionReason && (
                  <div className="mt-0.5 text-foreground-2">
                    {data.rejectionReason}
                  </div>
                )}
                {data.status === "cancelled" && (
                  <div className="mt-0.5 text-foreground-2">
                    {data.cancellationReason ??
                      "Hubungi Logistik OSUI Mahawaditra kalau ada pertanyaan."}
                  </div>
                )}
                {data.status === "overdue" && (
                  <div className="mt-0.5 text-foreground-2">
                    Kamu belum mengembalikan instrumen sampai lewat tanggal
                    kembali. Mohon segera dikembalikan ke Sekre.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent>
                <LoanStepper steps={stepLabels} current={step} />
              </CardContent>
            </Card>
          )}

          {data.status === "reviewing" && data.instrumentConfirmed && (
            <>
              <StatusNote>
                Instrumen kamu udah dikonfirmasi tersedia! Isi data di bawah ini
                untuk lanjut proses kontrak peminjaman.
              </StatusNote>
              <Stage2Form
                ticketId={data.ticketId}
                accessCode={accessCode}
                onSuccess={refetch}
              />
            </>
          )}

          {data.status === "returned" && (
            <StatusNote>
              Terima kasih sudah mengembalikan instrumennya!
            </StatusNote>
          )}

          {data.status === "active" && (
            <StatusNote>
              Instrumen kamu sedang dipinjam. Dijaga dan jangan lupa
              dikembalikan sebelum tanggal jatuh tempo ya!
            </StatusNote>
          )}

          {data.status === "active" && data.dueDate && (
            <p className="text-sm text-muted-foreground">
              Jatuh Tempo:{" "}
              <span className="tabular font-medium text-foreground">
                {new Date(data.dueDate).toLocaleDateString("id-ID")}
              </span>
            </p>
          )}

          {(data.status === "submitted" || data.status === "reviewing") &&
            !data.instrumentConfirmed && (
              <StatusNote>
                Admin sedang mereview pengajuan dan mengecek ketersediaan
                instrumen kamu.
              </StatusNote>
            )}

          {data.status === "documents_uploaded" && (
            <StatusNote>Dokumen kamu sedang direview admin.</StatusNote>
          )}

          {data.status === "ready_to_pickup" && data.hasInitialAddendum && (
            <StatusNote>
              Addendum sudah dikirim. Menunggu konfirmasi admin.
            </StatusNote>
          )}

          {data.isExtensionPeriod &&
            !data.needsExtensionDocuments &&
            !data.canFillExtensionAddendum &&
            !data.hasInitialAddendum && (
              <StatusNote>
                Dokumen perpanjangan sedang direview admin.
              </StatusNote>
            )}

          {(data.status === "active" || data.status === "overdue") &&
            data.hasFinalAddendum && (
              <StatusNote>
                Addendum pengembalian sudah dikirim. Menunggu admin konfirmasi
                pengembalian di Sekre.
              </StatusNote>
            )}

          {(data.status === "contract_generated" ||
            data.needsExtensionDocuments) && (
            <StatusNote>
              Kontrak kamu udah siap! Download, pahami kontraknya, tanda tangan,
              lalu upload lagi bareng dokumen pendukung lainnya.
            </StatusNote>
          )}

          {(data.status === "contract_generated" ||
            data.needsExtensionDocuments) && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
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
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Download Kontrak
              </Button>
            </div>
          )}

          {(data.status === "contract_generated" ||
            data.needsExtensionDocuments) && (
            <UploadDocumentsForm
              ticketId={data.ticketId}
              accessCode={accessCode}
              isExtension={data.needsExtensionDocuments}
              uploadedDocumentTypes={data.uploadedDocumentTypes}
              onSuccess={refetch}
            />
          )}

          {data.status === "ready_to_pickup" && !data.hasInitialAddendum && (
            <StatusNote>
              Instrumen kamu siap diambil! Koordinasi jadwal pengambilan dengan
              staf Logistik OSUI (info kontak bisa dicek lewat email), lalu isi
              kondisi awal di bawah ini.
            </StatusNote>
          )}

          {((data.status === "ready_to_pickup" && !data.hasInitialAddendum) ||
            data.canFillExtensionAddendum) && (
            <AddendumForm
              ticketId={data.ticketId}
              accessCode={accessCode}
              onSuccess={refetch}
            />
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

          {(data.canExtend ||
            ((data.status === "active" || data.status === "overdue") &&
              data.hasInitialAddendum &&
              !data.hasFinalAddendum)) && (
            <div className="flex flex-wrap items-center gap-3">
              {data.canExtend && !showExtendForm && (
                <Button onClick={() => setShowExtendForm(true)}>
                  Perpanjang
                </Button>
              )}
              {(data.status === "active" || data.status === "overdue") &&
                data.hasInitialAddendum &&
                !data.hasFinalAddendum &&
                !showReturnForm && (
                  <Button
                    variant="outline"
                    onClick={() => setShowReturnForm(true)}
                  >
                    {data.canExtend ||
                    !data.dueDate ||
                    new Date(data.dueDate) < new Date()
                      ? "Kembalikan"
                      : "Kembalikan Lebih Awal"}
                  </Button>
                )}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-6">
      <div className="flex flex-col items-center gap-2">
        <span className="h-2.5 w-10 rounded-full bg-gold" />
        <div className="font-heading text-h1 text-navy">BATON</div>
        <div className="tabular text-micro uppercase text-muted-foreground">
          Tiket {ticketId}
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h2 className="font-heading text-h3 text-foreground">
                Masukkan Kode Akses
              </h2>
              <p className="mt-1 text-caption text-muted-foreground">
                Masukkan kode akses yang dikirim ke email kamu untuk buka status
                peminjaman ini.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">Kode Akses</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Kode Akses"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Buka
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="max-w-sm text-center text-caption text-muted-foreground">
        Lupa kode aksesnya? Cek email konfirmasi yang kamu terima pas kirim
        pengajuan.
      </p>
      <Link
        href="/status"
        className={cn(buttonVariants({ variant: "link", size: "sm" }))}
      >
        Cek tiket lain
      </Link>
    </div>
  );
}
