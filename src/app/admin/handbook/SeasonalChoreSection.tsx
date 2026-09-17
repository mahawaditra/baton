import { TaskCard } from "./TaskCard";

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

      <TaskCard title="Update Loan Settings">
        <p>
          Dikerjain tiap awal kepengurusan, atau kapan pun ada yang berubah (due
          date baru, deposit naik, dll). Semua field wajib diisi ulang tiap kali
          Save — bukan cuma yang berubah.
        </p>
        <ul className="list-disc pl-5">
          <li>Due date, deposit (penuh & parsial), grace days.</li>
          <li>Nomor rekening bank buat deposit.</li>
          <li>
            <strong>Data penandatangan (PIHAK PERTAMA)</strong> — paling penting
            kalau Ketua Logistik ganti: nama, HP, LINE ID, nomor KTP, alamat,
            Fakultas/Jurusan, angkatan, section/instrumen, dan gambar tanda
            tangan. Ini yang kecetak di tiap kontrak baru — kalau lupa diupdate,
            kontrak baru masih pakai data Ketua lama.
          </li>
        </ul>
        <p>
          Toggle nomor HP tampil di FAQ landing itu terpisah dari form ini —
          apply-nya langsung begitu dicentang, nggak nunggu tombol Save. Adanya
          toggle ini bebas ketua logistiknya aja karena ini masalah consent jika
          si ketua mau nomor HP-nya nggak ditampilin di FAQ. Tapi kalau ketua
          logistiknya mau, ya silakan aja dicentang.
        </p>
      </TaskCard>

      <TaskCard title="Transfer to Ongoing — sebelum musim Prelude">
        <p>
          Pencet sebelum musim intake mulai, sebelum batch peminjam baru masuk.
          Ada di Dashboard, di samping tombol view all Active Loans.
        </p>
        <p>
          Yang terjadi: semua loan active/overdue yang belum pernah
          di-carry-over ditandain &quot;ongoing&quot; — statusnya sendiri nggak
          berubah, countdown due date, reminder, extension, sama proses return
          semua tetap jalan normal. Ini cuma buat misahin roster di dashboard
          biar batch baru nggak numpuk campur sama loan lama.
        </p>
        <p>
          Salah pencet atau ada yang harusnya nggak ke-carry? Buka detail
          request itu, ada tombol &quot;Move back to active roster&quot; di card
          Ongoing Loans-nya.
        </p>
      </TaskCard>

      <TaskCard title="Export Snapshot">
        <p>
          Dokumentasiin kondisi inventaris di satu titik waktu — misal abis
          Calang selesai, abis event besar, atau sebelum-sesudah pergantian
          kepengurusan. Ada di Reports.
        </p>
        <p>
          Kasih label yang jelas (contoh: &quot;Post Calang 2026&quot;),
          hasilnya file XLSX tersimpan ke Drive dan ke-download otomatis.
        </p>
        <p>
          Kalo pas jaman gw (anjng jaman gw ga tuh), Sheets tuh di-clone (Make a
          copy) sequentially. Yang pertama tuh awal tahun (dari tahun
          sebelumnya), tengah tahun atau sebelum Prelude, lalu setelah Prelude
          selesai. Gunanya tuh untuk perbandingan dan history aja. Although
          sekarang memang udah ada history peminjaman di BATON, ada baiknya
          punya rekap file xlsx-nya juga di Drive.
        </p>
      </TaskCard>

      <TaskCard title="Generate Annual Report">
        <p>
          Laporan tahunan dari 1 Januari tahun berjalan sampai sekarang. Ada di
          Reports, di atas Export Snapshot.
        </p>
        <p>
          Klik Generate dulu buat preview — belum kesimpen apa-apa. Baru klik
          Save kalau udah oke. Sekali di-save, laporannya nggak bisa diubah atau
          dihapus lagi.
        </p>
        <p>
          Fitur ini bagus untuk LPJ akhir kepengurusan untuk ingfo apa aja yang
          sudah dikerjakan di BATON.
        </p>
      </TaskCard>
    </div>
  );
}
