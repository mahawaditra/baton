import { staggerStyle } from "@/lib/utils";
import { HandbookAccordionRow } from "./HandbookAccordionRow";
import { HandoverNote } from "./HandoverNote";

const TASKS = {
  loanSettings: {
    title: "Update Loan Settings",
    body: (
      <>
        <p>
          Dikerjain tiap awal kepengurusan, atau kapan pun ada yang berubah (due
          date baru, deposit naik, dll). Form-nya udah keisi data terakhir, jadi
          tinggal ubah yang perlu. Begitu ada yang berubah, muncul bar Unsaved
          changes di bawah buat Save atau Discard.
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>Due date, deposit (penuh & parsial), grace days.</li>
          <li>Nomor rekening bank buat deposit.</li>
          <li>
            <strong>Data penandatangan (PIHAK PERTAMA)</strong> — paling penting
            kalau Ketua Logistik ganti: nama, HP, LINE ID, nomor KTP, alamat,
            Fakultas/Jurusan, angkatan, section/instrumen, dan gambar tanda
            tangan. Ini yang kecetak di tiap kontrak baru — kalau lupa diupdate,
            kontrak baru masih pakai data Ketua lama. Buat Ketua baru ada banner
            oranye di atas Settings yang ngingetin ini, hilang begitu datanya
            di-Save atas nama dia.
          </li>
        </ul>
        <p>
          Toggle Enable WhatsApp dan Enable LINE buat FAQ landing itu terpisah
          dari form ini — apply-nya langsung begitu dicentang, nggak nunggu
          tombol Save. Adanya toggle ini bebas ketua logistiknya aja karena ini
          masalah consent jika si ketua mau kontaknya nggak ditampilin di FAQ.
          Tapi kalau ketua logistiknya mau, ya silakan aja dicentang.
        </p>
      </>
    ),
  },
  exportSnapshot: {
    title: "Export Snapshot",
    body: (
      <>
        <p>
          Dokumentasiin kondisi inventaris di satu titik waktu. Ada di Reports.
          Kasih label yang jelas (contoh: &quot;Post Calang 2026&quot;),
          hasilnya file XLSX tersimpan ke Drive dan ke-download otomatis.
        </p>
        <p>
          Kalo pas jaman gw (anjng jaman gw ga tuh), Sheets tuh di-clone (Make a
          copy) sequentially: awal tahun (dari tahun sebelumnya), tengah tahun
          atau sebelum Prelude, lalu setelah Prelude selesai. Gunanya tuh untuk
          perbandingan dan history aja. Although sekarang memang udah ada
          history peminjaman di BATON, tetep dianjurkan punya rekap xlsx-nya di
          Drive sebagai data historis statis.
        </p>
      </>
    ),
  },
  transferToOngoing: {
    title: "Transfer to Ongoing",
    body: (
      <>
        <p>
          Pencet sebelum musim intake mulai, sebelum batch peminjam baru masuk.
          Ada di Dashboard, di samping tombol View all Active Loans, dan di
          samping search di Requests.
        </p>
        <p>
          Yang terjadi: semua loan yang Sedang Dipinjam/Terlambat dan belum
          pernah di-carry-over ditandain &quot;ongoing&quot; — statusnya sendiri
          nggak berubah, countdown due date, reminder, extension, sama proses
          return semua tetap jalan normal. Ini cuma buat misahin roster di
          dashboard biar batch baru nggak numpuk campur sama loan lama.
        </p>
        <p>
          Salah pencet atau ada yang harusnya nggak ke-carry? Buka detail
          request itu, ada tombol &quot;Move back to active roster&quot; di
          bagian atas tiketnya.
        </p>
      </>
    ),
  },
  annualReport: {
    title: "Generate Annual Report",
    body: (
      <>
        <p>
          Laporan tahunan dari 1 Januari tahun berjalan sampai sekarang. Ada di
          Reports. Fitur ini bagus untuk LPJ akhir kepengurusan untuk ingfo apa
          aja yang sudah dikerjakan di BATON.
        </p>
        <p>
          Klik Generate dulu buat preview — belum kesimpen apa-apa. Baru klik
          Save kalau udah oke. Sekali di-save, laporannya nggak bisa diubah atau
          dihapus lagi.
        </p>
      </>
    ),
  },
  surveyResults: {
    title: "Baca hasil survey",
    body: (
      <p>
        Ada di Reports, kartu Surveys. Semua admin bisa baca survey BATON (soal
        aplikasinya) maupun survey Logistik (soal pelayanan kalian). Jawabannya
        anonim, nggak ketaut ke tiket mana pun. Bisa difilter All-time atau per
        tahun, dan tahunnya ngikutin kapan tiketnya diajukan.
      </p>
    ),
  },
  handover: {
    title: "Handover Ketua",
    body: <HandoverNote />,
  },
};

type TaskKey = keyof typeof TASKS;

const MOMENTS: { title: string; when: string; tasks: TaskKey[] }[] = [
  {
    title: "Awal kepengurusan",
    when: "Begitu tim baru mulai, awal tahun",
    tasks: ["loanSettings", "exportSnapshot"],
  },
  {
    title: "Sebelum Prelude",
    when: "Tengah tahun, sebelum musim intake sekitar September–Oktober",
    tasks: ["transferToOngoing", "exportSnapshot"],
  },
  {
    title: "Setelah Prelude",
    when: "Begitu Prelude selesai",
    tasks: ["exportSnapshot"],
  },
  {
    title: "Akhir kepengurusan",
    when: "Sebelum serah terima jabatan",
    tasks: ["annualReport", "surveyResults", "handover"],
  },
];

export function SeasonalChoreSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="hidden text-h1 lg:block">Seasonal Chore</h1>
        <p className="mt-1 text-sm text-foreground-2">
          Hal-hal yang nggak dikerjain tiap hari, tapi wajib dicek tiap
          kepengurusan baru atau tiap mau masuk musim intake (Prelude, sekitar
          September–Oktober).
        </p>
      </div>

      <ol className="flex flex-col">
        {MOMENTS.map((moment, momentIndex) => (
          <li
            key={moment.title}
            data-stagger
            style={staggerStyle(momentIndex)}
            className="group/moment relative pb-6 pl-7 last:pb-0"
          >
            <span
              aria-hidden
              className="absolute top-1.5 left-0 h-3 w-3 rounded-full bg-plum"
            />
            <span
              aria-hidden
              className="absolute top-6 bottom-0 left-[5px] w-0.5 bg-border group-last/moment:hidden"
            />
            <h2 className="font-heading text-title text-foreground">
              {moment.title}
            </h2>
            <p className="mb-2 text-caption text-muted-foreground">
              {moment.when}
            </p>
            <div className="overflow-hidden rounded-md border border-border bg-card">
              {moment.tasks.map((taskKey) => (
                <HandbookAccordionRow
                  key={taskKey}
                  summary={
                    <span className="text-label text-foreground">
                      {TASKS[taskKey].title}
                    </span>
                  }
                >
                  {TASKS[taskKey].body}
                </HandbookAccordionRow>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
