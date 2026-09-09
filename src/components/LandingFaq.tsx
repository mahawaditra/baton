import { ChevronDown } from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.893a11.821 11.821 0 00-3.495-8.46z" />
    </svg>
  );
}

const FAQ_ITEMS = [
  {
    id: "verification",
    q: "Berapa lama proses verifikasi peminjaman?",
    a: "Pengajuan diverifikasi admin OSUI Mahawaditra dalam 1×24 jam sejak formulir dikirim.",
  },
  {
    id: "eligibility",
    q: "Siapa saja yang boleh meminjam?",
    a: "Peminjaman terbuka untuk Calon Anggota dan Anggota Aktif OSUI Mahawaditra. Kalau kamu bukan keduanya tapi tetap perlu meminjam, hubungi Ketua Logistik OSUI Mahawaditra.",
  },
  {
    id: "not-listed",
    q: "Instrumen yang aku mau tidak ada di daftar formulir.",
    a: "Daftar di formulir sudah mencakup instrumen yang bisa dipinjam. Beberapa instrumen seperti Flute dan alat perkusi memang tidak dipinjamkan.",
  },
  {
    id: "duration",
    q: "Berapa lama masa peminjaman?",
    a: "Kurang lebih satu tahun, sampai tanggal jatuh tempo yang berlaku untuk semua peminjam tahun itu. Masa peminjaman bisa diperpanjang.",
  },
  {
    id: "extension",
    q: "Bagaimana kalau aku butuh instrumennya lebih lama?",
    a: "Ajukan perpanjangan lewat halaman status peminjaman kamu. Tombol perpanjangan muncul mulai 30 hari sebelum tanggal jatuh tempo.",
  },
  {
    id: "damage",
    q: "Instrumen rusak atau hilang saat dipinjam?",
    a: "Lapor secepatnya ke Logistik OSUI Mahawaditra. Ada konsekuensi terhadap deposit sesuai kontrak peminjaman.",
  },
  {
    id: "deposit",
    q: "Deposit berapa dan kapan dikembalikan?",
    a: "Deposit dikembalikan penuh kalau instrumen dikembalikan tepat waktu atau lebih awal. Kalau telat, jumlah yang dikembalikan berkurang; kalau telat lebih dari masa tenggang, deposit tidak dikembalikan (Pasal 2 kontrak).",
  },
  {
    id: "return",
    q: "Bagaimana cara mengembalikan instrumen?",
    a: "Koordinasikan jadwal ke Sekre lewat LINE, isi addendum kondisi akhir di halaman status, lalu bawa instrumennya ke Sekre untuk dicek admin.",
  },
  {
    id: "data-safety",
    q: "KTP dan dokumen yang aku unggah aman?",
    a: "Semua dokumen disimpan di Google Drive privat OSUI dan hanya dipakai untuk keperluan kontrak peminjaman.",
  },
  {
    id: "email-missing",
    q: "Email berisi Ticket ID dan kode akses tidak masuk?",
    a: 'Cek folder Spam di email kamu dan tandai sebagai "Bukan spam". Kalau masih belum ada juga, hubungi Ketua Logistik OSUI Mahawaditra.',
  },
];

const LEFT_COLUMN = FAQ_ITEMS.slice(0, 5);
const RIGHT_COLUMN = FAQ_ITEMS.slice(5);

function FaqItem({
  item,
  whatsappNumber,
}: {
  item: { id: string; q: string; a: string };
  whatsappNumber?: string;
}) {
  return (
    <details className="group w-full rounded-xl border border-border px-5 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-body font-medium text-foreground [&::-webkit-details-marker]:hidden">
        {item.q}
        <span className="inline-flex shrink-0 text-muted-foreground group-open:rotate-180">
          <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </summary>
      <p className="mt-3 text-body text-muted-foreground">{item.a}</p>
      {item.id === "eligibility" && whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-caption font-medium text-foreground transition-colors hover:bg-muted"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
          Chat Ketua Logistik via WhatsApp
        </a>
      )}
    </details>
  );
}

export function LandingFaq({ whatsappNumber }: { whatsappNumber?: string }) {
  return (
    <section className="border-t border-border bg-surface px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-heading text-h2 text-foreground">
          F.A.Q
        </h2>
        <div className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-center lg:gap-4">
          <div className="flex flex-col gap-3 lg:w-[460px]">
            {LEFT_COLUMN.map((item) => (
              <FaqItem
                key={item.q}
                item={item}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3 lg:w-[460px]">
            {RIGHT_COLUMN.map((item) => (
              <FaqItem
                key={item.q}
                item={item}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
