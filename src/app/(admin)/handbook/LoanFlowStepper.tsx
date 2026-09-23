import { ArrowRight, ChevronDown, Split } from "lucide-react";
import type {
  BorrowingRequestStatus,
  InstrumentStatus,
} from "@/generated/prisma/client";
import { RequestStatusBadge } from "@/components/RequestStatusBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

type Actor = "peminjam" | "admin" | "sistem";

type Change =
  | { kind: "request"; path: BorrowingRequestStatus[] }
  | { kind: "instrument"; path: InstrumentStatus[] };

type Step = {
  title: string;
  actor: Actor;
  detail: string;
  changes?: Change[];
  note?: string;
};

const ACTOR_LABEL: Record<Actor, string> = {
  peminjam: "Peminjam",
  admin: "Admin",
  sistem: "Sistem",
};

const ACTOR_STYLE: Record<Actor, string> = {
  peminjam: "bg-plum-soft text-plum",
  admin: "bg-gold-soft text-gold-soft-foreground",
  sistem: "bg-muted text-muted-foreground",
};

const MAIN_STEPS: Step[] = [
  {
    title: "Submit pengajuan",
    actor: "peminjam",
    detail: "Isi form: nama, kontak, dan jenis instrumen yang diminati.",
    changes: [{ kind: "request", path: ["submitted"] }],
  },
  {
    title: "Assign instrumen",
    actor: "admin",
    detail: "Pilih instrumen yang cocok dari yang tersedia, lalu kabari peminjam lewat email.",
    changes: [
      { kind: "request", path: ["submitted", "reviewing"] },
      { kind: "instrument", path: ["available", "reserved"] },
    ],
  },
  {
    title: "Kontrak & upload dokumen",
    actor: "peminjam",
    detail:
      "Lengkapi data kontrak (KTP, alamat, fakultas, dll), generate dan tanda tangan PDF kontrak, lalu upload 3 dokumen: kontrak tanda tangan, bukti deposit, KTP.",
    changes: [{ kind: "request", path: ["contract_generated", "documents_uploaded"] }],
    note: "Kalau ada dokumen ditolak, balik ke sini buat upload ulang.",
  },
  {
    title: "Review dokumen",
    actor: "admin",
    detail:
      "Cek tiap dokumen satu-satu: tanda tangan lengkap? materai? nominal dan rekening bukti transfer cocok? KTP kebaca? Approve atau reject.",
    changes: [{ kind: "request", path: ["documents_uploaded", "ready_to_pickup"] }],
  },
  {
    title: "Terima di Sekre",
    actor: "peminjam",
    detail:
      "Begitu semua dokumen disetujui, datang ambil instrumen (dengan pengawasan staf Logistik) dan isi addendum kondisi awal beserta foto.",
  },
  {
    title: "Confirm handover",
    actor: "admin",
    detail: "Konfirmasi serah terima instrumen — hitung mundur due date mulai jalan.",
    changes: [
      { kind: "request", path: ["ready_to_pickup", "active"] },
      { kind: "instrument", path: ["reserved", "borrowed"] },
    ],
  },
  {
    title: "Loan aktif",
    actor: "sistem",
    detail:
      "Bisa di-extend (dari 30 hari sebelum due) atau di-return kapan aja. Kalau lewat due date, otomatis jadi Terlambat lewat cron harian — return tetap bisa dikonfirmasi dari situ.",
    changes: [{ kind: "request", path: ["active", "overdue"] }],
  },
];

const EXTEND_STEPS: Step[] = [
  {
    title: "Generate kontrak baru",
    actor: "peminjam",
    detail:
      "Kontrak perpanjangan baru plus addendum baru. Admin masih perlu confirm extension-nya sebelum ini keitung ongoing.",
    note: "Balik jadi Loan aktif lagi.",
  },
];

const RETURN_STEPS: Step[] = [
  {
    title: "Isi addendum akhir",
    actor: "peminjam",
    detail: "Kondisi akhir instrumen sebelum dikembalikan, plus foto.",
  },
  {
    title: "Cek kondisi & refund",
    actor: "admin",
    detail:
      "Cek kondisi sesuai addendum akhir, hitung refund deposit — penuh, parsial, atau hangus tergantung berapa hari telat vs grace days di Settings.",
  },
  {
    title: "Confirm return",
    actor: "admin",
    detail: "Konfirmasi pengembalian. Selesai.",
    changes: [
      { kind: "request", path: ["active", "returned"] },
      { kind: "instrument", path: ["borrowed", "available"] },
    ],
    note: "Instrumen jadi Nonaktif kalau kondisinya Pensiun atau Hilang.",
  },
];

function ActorChip({ actor }: { actor: Actor }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-micro uppercase",
        ACTOR_STYLE[actor],
      )}
    >
      {ACTOR_LABEL[actor]}
    </span>
  );
}

function ChangeRow({ change }: { change: Change }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-1.5">
      <span className="text-caption text-muted-foreground sm:w-[4.25rem] sm:shrink-0 sm:leading-[22px]">
        {change.kind === "request" ? "Request" : "Instrumen"}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1.5">
        {change.path.map((status, index) => (
          <span
            key={`${status}-${index}`}
            className="flex items-center gap-1.5"
          >
            {change.kind === "request" ? (
              <RequestStatusBadge status={status as BorrowingRequestStatus} />
            ) : (
              <StatusBadge status={status as InstrumentStatus} condition="ok" />
            )}
            {index < change.path.length - 1 && (
              <ArrowRight
                className="h-3 w-3 text-muted-foreground"
                strokeWidth={2}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepBody({ step, compact = false }: { step: Step; compact?: boolean }) {
  return (
    <>
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <h3
            className={cn(
              "font-heading text-foreground",
              compact ? "text-body font-semibold" : "text-title",
            )}
          >
            {step.title}
          </h3>
          <span className="inline-flex items-center gap-1.5">
            <ActorChip actor={step.actor} />
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              strokeWidth={1.75}
            />
          </span>
        </summary>
        <p className="mt-2 max-w-prose text-sm text-foreground-2">
          {step.detail}
        </p>
      </details>
      {step.changes && (
        <div className="mt-3 flex flex-col gap-1.5">
          {step.changes.map((change) => (
            <ChangeRow key={change.kind} change={change} />
          ))}
        </div>
      )}
      {step.note && (
        <p className="mt-2.5 text-caption text-muted-foreground">
          ↻ {step.note}
        </p>
      )}
    </>
  );
}

function Branch({
  letter,
  title,
  steps,
}: {
  letter: string;
  title: string;
  steps: Step[];
}) {
  return (
    <div className="border-t-2 border-gold pt-3">
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-lg font-bold text-gold">{letter}</span>
        <span className="text-caption uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <ol className="mt-3 flex flex-col gap-5">
        {steps.map((step) => (
          <li
            key={step.title}
            className="relative border-l border-border pl-4 before:absolute before:top-1.5 before:-left-[3px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold"
          >
            <StepBody step={step} compact />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function LoanFlowStepper() {
  return (
    <div>
      <ol>
        {MAIN_STEPS.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[2.5rem_1fr] gap-x-3 sm:grid-cols-[4rem_1fr] sm:gap-x-4"
          >
            <div className="relative">
              <span className="tabular font-heading text-2xl leading-none font-bold text-navy sm:text-4xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden
                className="absolute top-11 bottom-2 left-1 w-px bg-border sm:top-12"
              />
            </div>
            <div className="pb-9">
              <StepBody step={step} />
            </div>
          </li>
        ))}
        <li className="grid grid-cols-[2.5rem_1fr] gap-x-3 sm:grid-cols-[4rem_1fr] sm:gap-x-4">
          <div className="relative">
            <Split className="h-6 w-6 text-gold sm:h-7 sm:w-7" strokeWidth={2} />
          </div>
          <div>
            <p className="text-caption uppercase tracking-wider text-muted-foreground">
              Lalu, salah satu
            </p>
            <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
              <Branch letter="A" title="Perpanjang" steps={EXTEND_STEPS} />
              <Branch letter="B" title="Kembalikan" steps={RETURN_STEPS} />
            </div>
          </div>
        </li>
      </ol>
    </div>
  );
}
