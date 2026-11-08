import { staggerStyle } from "@/lib/utils";
import { HandbookCallout } from "./HandbookCallout";
import { HandoverNote } from "./HandoverNote";
import { InstallGuide } from "./InstallGuide";
import { RoleMatrix } from "./RoleMatrix";
import { TaskCard } from "./TaskCard";

const HELP_STEPS = [
  {
    title: "Ketua atau senior",
    body: "Sekadar bingung cara make BATON? Tanya mereka aja, kemungkinan besar udah pernah ketemu kasus yang sama.",
  },
  {
    title: "Troubleshooting",
    body: "Ketua-nya juga nga tau, atau beneran error? Cek dulu section Troubleshooting, siapa tau udah pernah kejadian.",
  },
  {
    title: "Zenka",
    body: 'Kalo emang buntu, baru hubungi guwe. Medsos gw ada di button website pribadi gw, di section "Why is this a Thing?" homepage BATON.',
  },
];

const GLOSSARY = [
  {
    term: "CALANG",
    definition:
      "Calon Anggota, mahasiswa yang belum jadi anggota aktif OSUI Mahawaditra tapi udah boleh minjam alat.",
  },
  {
    term: "Addendum",
    definition:
      "Laporan kondisi instrumen plus foto, diisi peminjam pas ambil (kondisi awal) dan pas balikin (kondisi akhir).",
  },
  {
    term: "Pihak Pertama / Kedua",
    definition:
      "Istilah di kontrak. Pihak Pertama itu penandatangan dari OSUI (biasanya Ketua Logistik), Pihak Kedua itu peminjam.",
  },
  {
    term: "Grace days",
    definition:
      "Batas hari toleransi telat sebelum deposit hangus. Diatur di Settings.",
  },
  {
    term: "Dibooking vs Dipinjam",
    definition:
      "Dibooking = udah di-assign tapi belum di-handover. Dipinjam = udah di-handover, lagi beneran dipegang peminjam.",
  },
  {
    term: "Slot instrumen",
    definition:
      "Berapa peminjam aktif yang boleh nempel ke satu instrumen dari tipe yang sama (misal Violin 1, Contrabass 2). Diatur per tipe di Settings.",
  },
  {
    term: "Ongoing",
    definition:
      "Loan yang udah di-carry lewat Transfer to Ongoing, buat misahin peminjam lama dari batch intake baru.",
  },
  {
    term: "Pre-BATON",
    definition:
      "Peminjam dari sebelum ada BATON, jadi nggak punya tiket di sistem. Namanya ditulis kayak Adit '24.",
  },
];

export function OnboardingSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="hidden text-h1 lg:block">Onboarding</h1>
        <p className="mt-1 text-sm text-foreground-2">
          Buat elu-elu yang baru pegang akses admin BATON — ini konteksnya.
        </p>
      </div>

      <TaskCard title="Kenapa BATON ada?">
        <p>
          Gw sempet jadi wakadiv (2022) dan kadiv Logistik (2023). Jadi gw tau
          betapa resenya inventarisasi di Sheets gampang outdated karena
          update-nya manual semua, pada males ngejar-ngejar peminjam soal
          deadline, mana addendum alat cuma dokumen Word yang template-nya jelek
          pula.
        </p>
        <p>
          BATON ini setengah alat handoff, setengah proyek pribadi yang bakal
          terus gw maintain selama masih inget atau dibutuhin. Sengaja masih
          hybrid sama Google: file tetep di Drive Logistik, login pakai akun
          Google, dan kontrak fisik bermaterai itu tetep yang beneran mengikat
          secara legal.
        </p>
      </TaskCard>

      <TaskCard title="Role di BATON">
        <RoleMatrix />
        <p className="text-caption">
          Overlord itu cuma gw, dan nggak bakal ada yang lain. Kalau ada yang
          kerasa &quot;kok gw nggak bisa X&quot;, kemungkinan itu emang fitur
          khusus role di atas lu.
        </p>
        <HandoverNote className="text-caption" />
      </TaskCard>

      <TaskCard title="Install BATON di HP">
        <p>
          Buka <strong>admin.baton.my.id</strong> di browser HP lu, bukan{" "}
          <strong>baton.my.id</strong> (itu punya peminjam, beda PWA juga).
        </p>
        <InstallGuide />
        <p className="text-caption">
          Tetep aja bukan app native, jadi fitur kayak push notification belum
          bisa.
        </p>
      </TaskCard>

      <HandbookCallout>
        Semua file BATON (kontrak, addendum, foto items dll) ada di Drive
        Logistik, folder BATON warna ungu. JANGAN PERNAH DIHAPUS! Isinya udah
        organized, cek aja sendiri.
      </HandbookCallout>

      <TaskCard title="Cara minta bantuan">
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {HELP_STEPS.map((step, index) => (
            <li
              key={step.title}
              data-stagger
              style={staggerStyle(index)}
              className="flex flex-col gap-1.5 rounded-md bg-muted p-3"
            >
              <span className="tabular flex h-5 w-5 items-center justify-center rounded-full bg-surface text-micro font-semibold tracking-normal text-foreground">
                {index + 1}
              </span>
              <span className="text-label text-foreground">{step.title}</span>
              <span className="text-caption text-foreground-2">
                {step.body}
              </span>
            </li>
          ))}
        </ol>
        <p>
          Pertanyaan operasional dari peminjam yang nggak kejawab di FAQ: arahin
          ke Ketua Logistik OSUI Mahawaditra.
        </p>
      </TaskCard>

      <TaskCard title="Butuh fitur baru?">
        <p>
          Zuzurly bisa, TAPI tergantung. Omongin dulu sama ketua, terus ke gw.
          Kalo kecil sih santuy ntar gw implementasikan free of charge. Kalo
          besar, baru diomongin dulu karena gw as of now adalah (semi)
          functional WORKING ADULT.
        </p>
      </TaskCard>

      <TaskCard title="Glosarium">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:gap-y-2">
          {GLOSSARY.map(({ term, definition }) => (
            <div key={term} className="flex flex-col gap-0.5 sm:contents">
              <dt className="text-label text-foreground">{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
      </TaskCard>

      <div className="rounded-md bg-gold-soft p-5 text-sm text-gold-soft-foreground">
        <p className="font-heading text-title">PLS JANGAN MALES</p>
        <p className="mt-1">
          Harus self-aware memang Logistik for the most part divisi gabut, APA
          LAGI ini udah gw buatin platform-nya. So GAK ADA ALASAN MACEM MAGER
          MANUAL LAGI and please for the love of God JANGAN MALES.
        </p>
      </div>
    </div>
  );
}
