import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Berapa lama proses verifikasi peminjaman?",
    a: "Pengajuan diverifikasi admin OSUI Mahawaditra dalam 1×24 jam sejak formulir dikirim.",
  },
  {
    q: "Siapa saja yang boleh meminjam?",
    a: "Peminjaman terbuka untuk Calon Anggota dan Anggota Aktif OSUI Mahawaditra. Kalau kamu bukan keduanya tapi tetap perlu meminjam, hubungi Ketua Logistik OSUI Mahawaditra.",
  },
  {
    q: "Instrumen yang aku mau tidak ada di daftar formulir.",
    a: "Daftar di formulir sudah mencakup instrumen yang bisa dipinjam. Beberapa instrumen seperti Flute dan alat perkusi memang tidak dipinjamkan.",
  },
  {
    q: "Berapa lama masa peminjaman?",
    a: "Kurang lebih satu tahun, sampai tanggal jatuh tempo yang berlaku untuk semua peminjam tahun itu. Masa peminjaman bisa diperpanjang.",
  },
  {
    q: "Bagaimana kalau aku butuh instrumennya lebih lama?",
    a: "Ajukan perpanjangan lewat halaman status peminjaman kamu. Tombol perpanjangan muncul mulai 30 hari sebelum tanggal jatuh tempo.",
  },
  {
    q: "Instrumen rusak atau hilang saat dipinjam?",
    a: "Lapor secepatnya ke Logistik OSUI Mahawaditra. Ada konsekuensi terhadap deposit sesuai kontrak peminjaman.",
  },
  {
    q: "Deposit berapa dan kapan dikembalikan?",
    a: "Deposit dikembalikan penuh kalau instrumen dikembalikan tepat waktu atau lebih awal. Kalau telat, jumlah yang dikembalikan berkurang; kalau telat lebih dari masa tenggang, deposit tidak dikembalikan (Pasal 2 kontrak).",
  },
  {
    q: "Bagaimana cara mengembalikan instrumen?",
    a: "Koordinasikan jadwal ke Sekre lewat LINE, isi addendum kondisi akhir di halaman status, lalu bawa instrumennya ke Sekre untuk dicek admin.",
  },
  {
    q: "KTP dan dokumen yang aku unggah aman?",
    a: "Semua dokumen disimpan di Google Drive privat OSUI dan hanya dipakai untuk keperluan kontrak peminjaman.",
  },
  {
    q: "Email berisi Ticket ID dan kode akses tidak masuk?",
    a: 'Cek folder Spam di email kamu dan tandai sebagai "Bukan spam". Kalau masih belum ada juga, hubungi Ketua Logistik OSUI Mahawaditra.',
  },
];

const ADMIN_ITEM = {
  q: "Bagaimana kalau aku admin?",
  a: (
    <>
      Sini{" "}
      <Link
        href="/admin"
        className="font-medium text-foreground underline underline-offset-2 hover:text-navy"
      >
        masuk
      </Link>
      .
    </>
  ),
};

const LEFT_COLUMN = FAQ_ITEMS.slice(0, 5);
const RIGHT_COLUMN = FAQ_ITEMS.slice(5);

function FaqItem({ item }: { item: { q: string; a: ReactNode } }) {
  return (
    <details className="group w-full rounded-xl border border-border px-5 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-body font-medium text-foreground [&::-webkit-details-marker]:hidden">
        {item.q}
        <span className="inline-flex shrink-0 text-muted-foreground group-open:rotate-180">
          <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </summary>
      <p className="mt-3 text-body text-muted-foreground">{item.a}</p>
    </details>
  );
}

export function LandingFaq() {
  return (
    <section className="border-t border-border bg-surface px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-heading text-h2 text-foreground">
          F.A.Q
        </h2>
        <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-center lg:gap-4">
          <div className="flex flex-col gap-3 lg:w-[460px]">
            {LEFT_COLUMN.map((item) => (
              <FaqItem key={item.q} item={item} />
            ))}
          </div>
          <div className="flex flex-col gap-3 lg:w-[460px]">
            {RIGHT_COLUMN.map((item) => (
              <FaqItem key={item.q} item={item} />
            ))}
          </div>
        </div>
        <div className="mt-3 lg:mx-auto lg:w-[460px]">
          <FaqItem item={ADMIN_ITEM} />
        </div>
      </div>
    </section>
  );
}
