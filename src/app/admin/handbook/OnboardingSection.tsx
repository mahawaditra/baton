import { TaskCard } from "./TaskCard";

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
          deposit sama deadline, mana addendum alat cuma dokumen Word yang
          template-nya jelek pula, format ga konsisten, bahkan setelah gw
          reorganize sheets jadi ada color coding pun ya ga bisa salahin yang
          lain pada mageran juga.
        </p>
        <p>
          BATON ini setengah alat handoff, setengah proyek pribadi yang bakal
          terus gw maintain selama masih inget atau dibutuhin. Siapa pun yang
          jadi staf Logistik tahun itu otomatis jadi <strong>Staff</strong> —
          akses harian ke requests, inventaris, review dokumen, yaa job desc
          logistik biasa lah. Ketua Logistik pegang <strong>Ketua</strong> —
          Staff plus akses konfigurasi di Settings, tapi aksesnya akan dicabut
          ketika masa jabatannya habis. Gw sendiri tetep pegang{" "}
          <strong>Overlord</strong> — akses penuh ke konfigurasi & data
          historis, tapi bukan yang jalanin operasionalnya sehari-hari. Di atas
          semuanya ada akun <strong>Pengurus</strong> permanen OSUI yang bisa
          ngawasin, termasuk aktif/nonaktifin Ketua dan Staff.
        </p>
        <p>
          BATON ini juga sengaja masih hybrid sama ekosistem Google, bukan
          gantiin total: file tetep di folder Drive divisi Logistik, admin tetep
          login pakai akun Google, dan kontrak fisik bermaterai itu tetep yang
          beneran mengikat secara legal — bukan yang di BATON. BATON tuh
          basically digitalisasi Logistik OSUI workflow aja — tracking,
          reminder, status, riwayat.
        </p>
      </TaskCard>

      <TaskCard title="Role di BATON">
        <p>
          <strong>Staff</strong> — kalo lu staf logistik tahun ini, ya lu
          otomatis Staff (harusnya). Bisa proses request, assign instrumen,
          review dokumen, confirm handover/return, dan akses semua fitur
          operasional harian. Settings cuma bisa dilihat, nggak bisa diubah.
        </p>
        <p>
          <strong>Ketua</strong> — Ketua Logistik tahun berjalan. Bisa semua
          yang Staff bisa + edit Loan Settings, edit slot sharing instrumen
          (Settings juga), tambah Staff baru, dan aktif/nonaktifin Staff.
        </p>
        <p>
          <strong>Pengurus</strong> — akun permanen OSUI, cuma dua: PI OSUI dan
          Logistik OSUI. Akses operasionalnya sama kayak Staff (Settings cuma
          bisa dilihat), tapi bisa tambah Staff atau Ketua baru dan
          aktif/nonaktifin Ketua dan Staff.
        </p>
        <p>
          <strong>Overlord</strong> — gw, developer BATON. Semua yang Ketua bisa
          + aktif/nonaktifin Pengurus. Kalau ada yang kerasa &quot;kok gw
          nggak bisa X&quot;, kemungkinan itu emang fitur khusus role di atas
          lu.
        </p>
      </TaskCard>

      <TaskCard title="BATON ada versi mobile gak?">
        <p>
          BATON sudah mobile friendly kalau buka di browser mobile, tapi kalau
          versi app native layaknya download dari Play Store/App Store, belum
          ada.{" "}
        </p>
        <p>
          TAPI BATON itu adalah PWA (Progressive Web App) — Gak sekedar shortcut
          yang buka di browser dari home screen, tapi actual seperti app native
          (gak ada search bar). Nanti kalo dibuka langsung ke Landing, kalau mau
          akses Admin Dashboard tinggal ke FAQ aja, ada jalan pintasnya{" "}
        </p>
        <p>
          Kalo mau install BATON ke home screen, tinggal buka di browser mobile:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Android</strong>: klik menu (titik 3 di kanan atas or
            something like that), pilih &quot;Add to Home Screen&quot;. Kalo
            ditanya as shortcut or app, pilih &quot;app&quot;.
          </li>
          <li>
            <strong>iOS</strong>: buka di Safari, klik Share (kotak dengan panah
            ke atas), pilih &quot;Add to Home Screen&quot;
          </li>
        </ul>
        <p>
          Tapi tetep aja, BATON itu bukan app native, jadi fitur-fitur tertentu
          (misal: push notification) belum bisa. Kenapa? Karena itu entirely
          different tech stack dari web app yang gw tau cara bangunnya.
        </p>
      </TaskCard>

      <TaskCard title="Ini semua file peminjam ada di Drive Logistik?">
        <p>
          Yoi, semua file BATON (kontrak, addendum, foto items dll,) itu ada di
          Drive Logistik di folder BATON (warna ungu) dan{" "}
          <strong>JANGAN PERNAH DIHAPUS</strong>!
        </p>
        <p>Isinya udah organized, cek aja sendiri.</p>
      </TaskCard>

      <TaskCard title="Cara minta bantuan">
        <p>
          Kalo sekadar bingung cara make BATON (bukan soal bug/error) bisa tanya
          Ketua Logistik atau senior yang udah pernah pegang BATON aja —
          kemungkinan besar udah pernah ketemu kasus yang sama.
        </p>
        <p>
          Kalau Ketua-nya juga nga tau, atau ini beneran soal sistem error: cek
          dulu section Troubleshooting, siapa tau udah pernah kejadian dan ada
          solusinya di situ. Kalo emang buntu, baru hubungi guwe.
        </p>
      </TaskCard>

      <TaskCard title="Butuh fitur baru?">
        <p>
          Zuzurly bisa, TAPI tergantung. Nanti coba omongin dulu sama ketua,
          terus nanti coba omongin ke gw juga.
        </p>
        <p>
          Gw akan cek dulu kalo fitur itu feasible (as in ga campur tangan ke
          database) dan juga nentuin apakah skalanya kecil atau besar. Kalo
          kecil sih santuy ntar gw implementasikan free of charge. Kalo besar,
          baru diomongin dulu karena gw as of now adalah (semi) functional
          WORKING ADULT jadi gw ada kesibukan dan mesti sempetin waktu untuk
          implementasi fitur besar.
        </p>
      </TaskCard>

      <TaskCard title="Serah terima jabatan Ketua (Handover)">
        <p>
          Pas masa jabatan Ketua habis, dia klik tombol{" "}
          <strong>Handover</strong> di baris namanya sendiri di Settings, bagian
          Admin Management. Lalu akan mengikuti tahapan-tahapannya.
        </p>
      </TaskCard>

      <TaskCard title="Notes">
        <p>
          <strong>PLS JANGAN MALES</strong>. BATON ini gw bikin untuk bantu
          kalian pengurus Logistik supaya ga perlu repot-repot ngejar-ngejar
          peminjam soal deposit, deadline, addendum, dll. Harus self-aware
          memang Logistik for the most part memang divisi gabut, modal nguli
          kalo ada event aja, APA LAGI ini udah gw buatin platform yang
          memudahkan kalian untuk operasional inventarisasi dan peminjaman jadi
          ga perlu manual kayak Logisik Pre-2026. So GAK ADA ALASAN MACEM MAGER
          MANUAL LAGI and{" "}
          <strong>please for the love of God JANGAN MALES</strong>.
        </p>
      </TaskCard>
    </div>
  );
}
