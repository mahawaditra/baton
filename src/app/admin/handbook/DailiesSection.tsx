import { TaskCard } from "./TaskCard";

export function DailiesSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="hidden text-h1 lg:block">Dailies</h1>
        <p className="mt-1 text-sm text-foreground-2">
          Hal-hal yang paling sering dikerjain admin, urut sesuai kapan
          munculnya di alur peminjaman.
        </p>
      </div>

      <TaskCard title="Proses request baru">
        <p>
          Buka <strong>Requests</strong>, cari yang statusnya{" "}
          <strong>submitted</strong>. Cek jenis instrumen yang diminta, lihat
          ketersediaan di <strong>Instruments</strong>. Kalau ada yang cocok,
          assign dari detail request-nya.
        </p>
        <p>
          Nggak ada yang cocok? Reject aja, kasih alasan singkat — nanti
          otomatis ke-email ke peminjam.
        </p>
      </TaskCard>

      <TaskCard title="Review dokumen">
        <p>Tiap dokumen diperiksa satu-satu, bukan sekaligus:</p>
        <ul className="list-disc pl-5">
          <li>Kontrak tanda tangan — tanda tangan lengkap, materai ada.</li>
          <li>
            Bukti deposit — nominal sama rekening tujuan cocok sama yang ada di
            Settings.
          </li>
          <li>KTP — kebaca jelas, nama & data cocok sama form.</li>
        </ul>
        <p>
          Kalau ada yang nggak sesuai, reject dokumen itu aja (bukan semuanya) —
          peminjam upload ulang yang itu doang.
        </p>
      </TaskCard>

      <TaskCard title="Serah terima di Sekre">
        <p>
          Peminjam nanti akan hubungi ketua logistik, atau lebih baiknya lagi
          kalian yang sudah approve dokumen itu langsung aja hubungi si
          peminjamnya proactively. Naturally kalian bakal janjian kapan bisa
          ambil, tapi SEHARUSNYA kalo kalian udah assign instrument ke peminjam
          tuh ya harusnya kalian juga sudah persiapkan instrumennya di Sekre —
          JANGAN MALES, jangan nunggu peminjam yang minta-minta.
        </p>
        <p>
          Peminjam nanti akan dateng ke Sekre dan HARUS ADA staf yang saksi si
          peminjam ambil instrumen. Pastiin juga peminjam juga kalau bisa isi
          addendum kondisi awal + foto sebelum di-confirm handover — jadi suruh
          aja di tempat, lu suruh dia isi woy addendum. Kalo udah oke, confirm
          handover di BATON. instrumen resmi jadi tanggung jawab dia.
        </p>
      </TaskCard>

      <TaskCard title="Proses perpanjangan">
        <p>
          Button extend di status page peminjam tuh baru muncul kalau peminjam
          30 hari sebelum due date. Mereka akan cek ulang data mereka, lalu
          generate kontrak perpanjangan beserta checkpoint addendum. Cek
          dokumennya sama kayak proses awal, terus confirm extension-nya biar
          keitung di Ongoing Loans dengan latest due date.
        </p>
      </TaskCard>

      <TaskCard title="Proses pengembalian">
        <p>
          Cek addendum kondisi akhir yang diisi peminjam, bandingin sama kondisi
          awal. Hitung refund deposit — penuh, parsial, atau hangus tergantung
          berapa hari telat vs grace days di Settings. Baru confirm return.
        </p>
      </TaskCard>
    </div>
  );
}
