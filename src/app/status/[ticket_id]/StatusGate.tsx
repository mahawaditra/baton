"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { getContractPdf, verifyAccessCode } from "./actions";
import { Stage2Form } from "./Stage2Form";
import { UploadDocumentsForm } from "./UploadDocumentsForm";
import { RequestData } from "./types";
import { AddendumForm } from "./AddendumForm";
import { ExtendForm } from "./ExtendForm";
import { SurveySection } from "./SurveySection";
import {
  getRequestStep,
  getStatusTurn,
  LOAN_STEP_LABELS,
  resolveNickname,
  type StatusTurn,
} from "@/lib/loan/loan-rules";
import { toastError } from "@/lib/toast";
import { normalizeAccessCode } from "@/lib/loan/id-generators";
import {
  clearTicketSaved,
  markTicketSaved,
} from "@/lib/loan/saved-ticket-cookie";
import { NETWORK_ERROR_MESSAGE } from "@/lib/network-fallback";
import { formatCalendarDate, formatJakartaDate } from "@/lib/format";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { LoanStepper } from "@/components/LoanStepper";
import { LoadingMarquee } from "@/components/LoadingMarquee";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/SubmitButton";
import { ContactLink, LineIcon, WhatsAppIcon } from "@/components/ContactLink";
import { Card, CardContent } from "@/components/ui/card";
import { TicketCard, TicketLabel } from "@/components/TicketCard";
import { StatusRow } from "@/components/StatusRow";
import { StatusLookupShell } from "../StatusLookupShell";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Download,
  Hourglass,
  Info,
  PenLine,
} from "lucide-react";
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

const GATE_DESCRIPTION =
  "Masukkan kode akses yang dikirim ke email kamu untuk buka status peminjaman ini.";
const GATE_FOOTNOTE =
  "Lupa kode aksesnya? Cek email konfirmasi yang kamu terima pas kirim pengajuan.";

function TicketIdHeader({ ticketId }: { ticketId: string }) {
  return (
    <div className="px-6 pt-5 pb-6">
      <TicketLabel>Ticket ID</TicketLabel>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <span className="tabular font-heading text-display tracking-[0.02em]">
          {ticketId}
        </span>
        <Link
          href="/status"
          className="text-caption font-medium text-hero-fg/70 underline-offset-4 transition-colors hover:text-hero-fg hover:underline"
        >
          Ganti
        </Link>
      </div>
    </div>
  );
}

const TICKET_MAIN_CLASS =
  "mx-auto -mt-10 flex w-full max-w-[51rem] flex-col gap-6 px-6 pb-12 md:pb-16";

function TicketHero({
  ticketId,
  children,
}: {
  ticketId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hero-bg px-6 pt-2 pb-16 text-hero-fg">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-micro uppercase text-gold">Tiket peminjaman</div>
        <h1 className="tabular mt-1 font-heading text-display tracking-[0.02em] text-hero-fg">
          {ticketId}
        </h1>
        {children}
      </div>
    </div>
  );
}

const TURN_TONE = {
  borrower: {
    label: "Giliran kamu",
    icon: PenLine,
    chip: "bg-gold text-hero-bg",
    bottomTone: "gold",
    callout: "border-gold/40 bg-gold-soft",
  },
  staff: {
    label: "Giliran staf",
    icon: Hourglass,
    chip: "bg-plum text-plum-soft",
    bottomTone: "plum",
    callout: "border-plum/25 bg-plum-soft",
  },
} as const;

function TurnRow({
  turn,
  className,
}: {
  turn: StatusTurn;
  className?: string;
}) {
  const tone = TURN_TONE[turn.actor];
  return (
    <StatusRow
      icon={tone.icon}
      chipClassName={tone.chip}
      title={tone.label}
      message={turn.message}
      className={className}
    />
  );
}

export function StatusGate({
  ticketId,
  hasSavedCode,
}: {
  ticketId: string;
  hasSavedCode: boolean;
}) {
  const [data, setData] = useState<RequestData | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [checking, setChecking] = useState(hasSavedCode);
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [downloadPending, startDownloadTransition] = useTransition();

  const refetch = useCallback(async () => {
    const savedCode = localStorage.getItem(`access_code_${ticketId}`);
    if (!savedCode) {
      clearTicketSaved(ticketId);
      return;
    }

    const result = await verifyAccessCode(ticketId, savedCode);
    if (result.success) {
      markTicketSaved(ticketId);
      setData(result.request);
      setAccessCode(savedCode);
    } else {
      localStorage.removeItem(`access_code_${ticketId}`);
      clearTicketSaved(ticketId);
      setData(null);
      setAccessCode(null);
    }
  }, [ticketId]);

  const refetchAfterSave = useCallback(async () => {
    try {
      await refetch();
    } catch {
      toastError(
        "Data berhasil tersimpan, tapi tampilan belum diperbarui. Muat ulang halaman ini.",
      );
    }
  }, [refetch]);

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        await refetch();
      } catch {
        toastError(NETWORK_ERROR_MESSAGE);
      } finally {
        if (active) setChecking(false);
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, [refetch]);

  async function handleSubmit(formData: FormData) {
    const code = normalizeAccessCode(String(formData.get("code") ?? ""));
    let result: Awaited<ReturnType<typeof verifyAccessCode>>;
    try {
      result = await verifyAccessCode(ticketId, code);
    } catch {
      toastError(NETWORK_ERROR_MESSAGE);
      return;
    }

    if (result.success) {
      localStorage.setItem(`access_code_${ticketId}`, code);
      markTicketSaved(ticketId);
      setData(result.request);
      setAccessCode(code);
    } else {
      toastError(result.error);
    }
  }

  if (checking) {
    return (
      <div className="flex-1">
        <TicketHero ticketId={ticketId}>
          <Skeleton className="mt-2 h-5 w-40 bg-hero-fg/15" />
          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="h-[22px] w-24 rounded-full bg-hero-fg/15" />
            <Skeleton className="h-3 w-32 bg-hero-fg/15" />
          </div>
        </TicketHero>

        <main className={TICKET_MAIN_CLASS}>
          <Card className="gap-0 py-0">
            <CardContent className="flex flex-col gap-5 py-6">
              {LOAN_STEP_LABELS.map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </CardContent>
          </Card>
          <LoadingMarquee />
        </main>
      </div>
    );
  }

  if (data && accessCode) {
    const step = getRequestStep(data.status, data.instrumentConfirmed);
    const stepLabels = LOAN_STEP_LABELS.map((label, index) =>
      index === 3 && data.status === "returned" ? "Selesai" : label,
    );

    const turn = getStatusTurn(data);

    return (
      <div className="flex-1">
        <TicketHero ticketId={data.ticketId}>
          <p className="mt-1 text-body-lg text-hero-fg/75">
            {resolveNickname(data.borrowerName, data.borrowerNickname)} ·{" "}
            {data.instrumentTypeRequested}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <RequestStatusBadge status={data.status} variant="pill" />
            <span className="tabular text-caption text-hero-fg/60">
              Diajukan {formatJakartaDate(data.createdAt)}
            </span>
          </div>
        </TicketHero>

        <main className={TICKET_MAIN_CLASS}>
          {step === "exception" ? (
            <div
              className={cn(
                "flex items-start gap-3 rounded-md border p-4 text-sm",
                data.status === "cancelled"
                  ? "border-border bg-muted"
                  : "border-destructive/40 bg-destructive-soft",
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
                {data.status === "overdue" && !data.hasFinalAddendum && (
                  <div className="mt-0.5 text-foreground-2">
                    Kamu belum mengembalikan instrumen sampai lewat tanggal
                    kembali. Mohon segera dikembalikan ke Sekre.
                  </div>
                )}
              </div>
            </div>
          ) : turn ? (
            <TicketCard
              bottomTone={TURN_TONE[turn.actor].bottomTone}
              top={
                <div className="px-6 py-6">
                  <LoanStepper steps={stepLabels} current={step} />
                </div>
              }
              bottom={<TurnRow turn={turn} className="px-6 pt-4 pb-5" />}
            />
          ) : (
            <Card className="gap-0 py-0">
              <CardContent className="py-6">
                <LoanStepper steps={stepLabels} current={step} />
              </CardContent>
            </Card>
          )}

          {step === "exception" && turn && (
            <TurnRow
              turn={turn}
              className={cn(
                "rounded-md border px-6 py-5",
                TURN_TONE[turn.actor].callout,
              )}
            />
          )}

          {data.status === "reviewing" && data.instrumentConfirmed && (
            <Stage2Form
              ticketId={data.ticketId}
              accessCode={accessCode}
              onSuccess={refetchAfterSave}
            />
          )}

          {data.status === "returned" && (
            <StatusNote>Makasih udah balikin instrumennya!</StatusNote>
          )}

          {data.status === "active" && !data.hasFinalAddendum && (
            <StatusNote>
              Kamu lagi pinjam instrumennya. Dijaga baik-baik, dan jangan lupa
              balikin sebelum jatuh tempo ya!
            </StatusNote>
          )}

          {data.status === "active" && data.dueDate && (
            <p className="text-sm text-muted-foreground">
              Jatuh Tempo:{" "}
              <span className="tabular font-medium text-foreground">
                {formatCalendarDate(data.dueDate, "id-ID")}
              </span>
            </p>
          )}

          {data.canFillSurvey && (
            <SurveySection
              ticketId={data.ticketId}
              accessCode={accessCode}
              hasFilledSurvey={data.hasFilledSurvey}
              onSubmitted={refetchAfterSave}
            />
          )}

          {(data.status === "contract_generated" ||
            data.needsExtensionDocuments) && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                disabled={downloadPending}
                onClick={() => {
                  startDownloadTransition(async () => {
                    try {
                      const result = await getContractPdf(
                        ticketId,
                        accessCode,
                      );
                      if (result.success) {
                        const link = document.createElement("a");
                        link.href = result.url;
                        link.click();
                      } else {
                        toastError(result.error);
                      }
                    } catch {
                      toastError("Gagal mengunduh kontrak. Coba lagi.");
                    }
                  });
                }}
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                {downloadPending ? "Menyiapkan..." : "Download Kontrak"}
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

          {data.status === "ready_to_pickup" &&
            !data.hasInitialAddendum &&
            data.pickupContact && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <ContactLink
                  href={data.pickupContact.whatsappUrl}
                  icon={WhatsAppIcon}
                  className="sm:flex-1"
                >
                  Chat via WhatsApp
                </ContactLink>
                {data.pickupContact.lineUrl && (
                  <ContactLink
                    href={data.pickupContact.lineUrl}
                    icon={LineIcon}
                    className="sm:flex-1"
                  >
                    Chat via LINE
                  </ContactLink>
                )}
              </div>
            )}

          {((data.status === "ready_to_pickup" && !data.hasInitialAddendum) ||
            data.canFillExtensionAddendum) && (
            <AddendumForm
              ticketId={data.ticketId}
              accessCode={accessCode}
              onSuccess={refetchAfterSave}
            />
          )}

          {showReturnForm && (
            <AddendumForm
              ticketId={data.ticketId}
              accessCode={accessCode}
              timing="final"
              onSuccess={() => {
                setShowReturnForm(false);
                refetchAfterSave();
              }}
            />
          )}

          {showExtendForm && data.canExtend && (
            <ExtendForm
              data={data}
              accessCode={accessCode}
              onSuccess={() => {
                setShowExtendForm(false);
                refetchAfterSave();
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
    <StatusLookupShell description={GATE_DESCRIPTION} footnote={GATE_FOOTNOTE}>
      <TicketCard
        topTone="hero"
        bottomClassName="ticket-unfold"
        top={<TicketIdHeader ticketId={ticketId} />}
        bottom={
          <form
            action={handleSubmit}
            className="flex flex-col gap-3 px-6 pt-4 pb-6"
          >
            <label
              htmlFor="code"
              className="text-micro uppercase text-muted-foreground"
            >
              Kode Akses
            </label>
            <Input
              id="code"
              name="code"
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="6 karakter dari email"
              className="tabular tracking-[0.12em] placeholder:tracking-normal"
              required
            />
            <SubmitButton pendingText="Memeriksa..." className="mt-1 w-full">
              Buka status
            </SubmitButton>
          </form>
        }
      />
    </StatusLookupShell>
  );
}
