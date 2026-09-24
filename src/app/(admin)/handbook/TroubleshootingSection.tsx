import { TaskCard } from "./TaskCard";

export function TroubleshootingSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="hidden text-h1 lg:block">Troubleshooting</h1>
        <p className="mt-1 text-sm text-foreground-2">
          Arsip insiden yang beneran pernah kejadian, plus beberapa operasi
          langka yang butuh akses khusus. Kalau ada insiden support baru yang
          udah keberesin, minta developer nambahin entry baru ke sini.
        </p>
      </div>

      <TaskCard title='Tombol "Download Kontrak" nggak kerespon di HP (Sep 2026)'>
        <p>
          Biasanya jaringan goyang pas mobile Safari. Minta peminjam coba lagi —
          biasanya langsung jalan. Kalau masih gagal terus, minta screenshot,
          kirim ke Zenka.
        </p>
      </TaskCard>

      <TaskCard title="Peminjam nggak bisa isi Fakultas/Jurusan (Sep 2026)">
        <p>
          Udah dibenerin — sekarang 2 kotak terpisah (Fakultas, Jurusan/Prodi).
          Kalau masih ada yang gagal isi field ini, screenshot errornya, kirim
          ke Zenka.
        </p>
      </TaskCard>

      <TaskCard title="Kenapa aku nggak bisa ubah kondisi instrumen yang lagi dipinjem?">
        <p>
          Sengaja supaya instrumen yang lagi punya peminjam aktif (Dibooking,
          Dipinjam, atau dua-duanya sekaligus kalau lagi di-share) di-lock di
          form edit — Condition, Status, DAN Location-nya nggak bisa diubah
          manual lewat form biasa sampai SEMUA peminjam aktifnya kelar
          (reject/cancel/return).
        </p>
        <p>
          Kalau ada laporan instrumen rusak SELAGI masih dipinjem: catat manual
          dulu di kolom Notes request-nya, baru input kondisi aslinya pas
          Confirm Return.
        </p>
        <p>
          Intinya JANGAN BANDEL ganti-ganti kondisi dan status instrumen yang
          sedang dipinjam.
        </p>
      </TaskCard>

      <TaskCard title="Instrumen hilang atau rusak berat">
        <p>
          Kalau instrumennya lagi nggak terikat request aktif: buka detail
          instrumennya, ubah Condition ke Hilang atau Pensiun. Status &amp;
          Loanable otomatis ke-set jadi Nonaktif / off.
        </p>
        <p>
          Kalau lagi terikat request aktif, lihat entry di atas — catat di Notes
          dulu, baru diproses pas return.
        </p>
        <p>
          Di laman status peminjam sendiri kita nggak sediain apa-apa buat ini —
          arahin peminjam buat langsung hubungi Ketua Logistik.
        </p>
        <p>
          Memang belum ada fitur buat flow revitalisasi. Maybe one day, soalnya
          itu fitur besar, so selagi gw ada waktu dan ada subsidi ya boleh aja
          request ke gw.
        </p>
      </TaskCard>

      <TaskCard title="Salah nambah instrumen baru">
        <p>
          Kalau add new instrument terus ada yang salah, yaudah edit aja. Kalau
          semisal yang salah itu uneditable (misal: ID, Type, atau Category),
          hubungi Zenka buat ubah manual di database.
        </p>
        <p>
          Memang sengaja gak ada fitur delete instrument supaya nggak ada yang
          asal hapus instrumen, karena itu bakal bikin data historis jadi nggak
          konsisten.
        </p>
      </TaskCard>

      <TaskCard title="Instrumen terbatas, pemegang double gimana? (Sep 2026)">
        <p>
          Slot per tipe instrumen diatur di Settings, bagian{" "}
          <strong>Instrument Sharing Slots</strong> — Ketua (atau Overlord)
          doang yang bisa ubah, tapi semua admin bisa lihat. By default 1 slot
          buat semua tipe instrumen; naikin manual (button +) buat tipe yang
          emang perlu di-share (misal Contrabass jadi 2). Nggak bisa diturunin
          lagi kalau ada unit yang saat ini beneran lagi dipegang sejumlah itu.
        </p>
        <p>
          Kalau slotnya masih kosong, instrumen itu tetep muncul di assignable
          instruments, walaupun statusnya udah
          &quot;Dibooking&quot;/&quot;Dipinjam&quot; buat peminjam lain — assign
          aja seperti biasa. Peminjam baru tetep isi kontrak + addendum SENDIRI,
          jadi kalau dia yang nyebabin kerusakan, dia sendiri yang tanggung
          jawab, bukan peminjam yang udah lebih dulu.
        </p>
        <p>
          Location di detail instrumen otomatis nunjukin gabungan nama semua
          peminjam aktif (contoh: &quot;Adit (2020) &amp; David (2020)&quot;) —
          nggak perlu lagi dicatet manual di Notes. Kondisi/status FINAL
          instrumen juga baru diminta pas peminjam yang TERAKHIR return — kalau
          masih ada peminjam lain yang megang, admin cuma nutup peminjaman orang
          itu doang.
        </p>
      </TaskCard>

      <TaskCard title="Undo Transfer to Ongoing yang salah pencet (massal)">
        <p>
          Buat 1-2 loan doang, ada tombol Move back to active roster&quot; di
          detail request-nya. Tapi kalau salah pencet buat SEMUA loan sekaligus,
          itu nggak ada tombolnya — butuh buka database (Supabase) langsung dan
          update baris-baris yang carry-over-nya salah. Hubungi Zenka buat ini,
          jangan coba-coba sendiri dari admin panel.
        </p>
      </TaskCard>

      <TaskCard title="Nambahin Pengurus atau Overlord baru">
        <p>
          Role Pengurus dan Overlord nggak bisa ditambahin dari UI — ini
          disengaja, dibuat manual di database sama Zenka. Dari Settings, Ketua
          cuma bisa nambahin Staff, sedangkan Pengurus dan Overlord bisa
          nambahin Staff atau Ketua.
        </p>
      </TaskCard>

      <TaskCard title="Link LINE di landing page nggak berfungsi (Sep 2026)">
        <p>
          Link &quot;Add Friend&quot; LINE itu BUKAN dirakit dari LINE ID biasa
          — itu link/token khusus yang di-generate manual dari app LINE si ketua
          (Profile → QR code → Copy link). Token ini bisa jadi{" "}
          <strong>kadaluarsa</strong> kalau ketua nge-klik tombol
          &quot;Regenerate&quot; lagi di app LINE-nya setelah link lama itu udah
          dipasang di Settings — link lama otomatis rusak begitu yang baru
          di-generate.
        </p>
        <p>
          Fix-nya: minta ketua buka app LINE-nya, generate ulang link Add Friend
          yang baru, copy, terus paste ke field &quot;LINE Add Friend Link&quot;
          di Settings (centang dulu &quot;Enable LINE&quot; kalau belum,
          field-nya baru muncul), klik Save di ujung field itu — bukan tombol
          &quot;Save Loan Settings&quot; di bawah, dua-duanya independen.
        </p>
      </TaskCard>

      <TaskCard title="Foto hasil addendum corrupt/kepotong/rusak (Sep 2026)">
        <p>
          Kejadian 24/09/2026 yaitu foto yang di-upload peminjam untuk
          Addendum Awal ada 5 foto dan yang berhasil hanya 1, sedangkan 4
          sisanya corrupt (gambarnya kepotong).
        </p>
        <p>
          Secara internal, 1 foto yang selamat itu masih bagus dan worth
          using as addendum and instrument photo. Tapi dari sisi peminjam,
          itu adalah bukti legal barang yang mereka pinjam dan berguna as
          their defense kalo kenapa-napa.
        </p>
        <p>
          Jadi ada baiknya minta fotonya aja lagi dari mereka secara
          informal (lewat LINE), nanti kirim aja ke gw untuk replace
          fotonya di Drive, gw ada script untuk replace fotonya supaya
          seamless untuk kalian dan juga peminjam. And of course, jangan
          lupa minta maaf dulu yes ke mereka (dan gw juga minta maap).
        </p>
        <p>
          <strong>
            DO NOT ATTEMPT TO DELETE/REPLACE THE PHOTO IN THE DRIVE FOLDER
            YOURSELF
          </strong>
          . Itu bakal merusak peminjamannya di sistem. Butuh script khusus
          untuk replace isi suatu file di drive.
        </p>
      </TaskCard>

      <TaskCard title="Glosarium">
        <ul className="list-disc pl-5">
          <li>
            <strong>CALANG</strong> — Calon Anggota, mahasiswa yang belum jadi
            anggota aktif OSUI Mahawaditra tapi udah boleh minjam alat.
          </li>
          <li>
            <strong>Addendum</strong> — laporan kondisi instrumen, diisi
            peminjam pas ambil (kondisi awal) dan pas balikin (kondisi akhir),
            plus foto.
          </li>
          <li>
            <strong>PIHAK PERTAMA / PIHAK KEDUA</strong> — istilah di kontrak.
            PIHAK PERTAMA itu penandatangan dari sisi OSUI (biasanya Ketua
            Logistik), PIHAK KEDUA itu peminjam.
          </li>
          <li>
            <strong>Grace days</strong> — batas hari toleransi telat sebelum
            deposit mulai kepotong/hangus. Diatur di Settings.
          </li>
          <li>
            <strong>Dibooking vs dipinjam</strong> — status instrumen. Dibooking
            = udah di-assign ke sebuah request tapi belum di-handover. Dipinjam
            = udah di-handover, lagi beneran dipinjam. Bisa lebih dari satu
            peminjam aktif bareng-bareng kalau instrumennya lagi di-share —
            lihat <strong>Slot instrumen</strong>.
          </li>
          <li>
            <strong>Slot instrumen</strong> — berapa banyak peminjam aktif yang
            boleh nempel ke instrumen dari SATU tipe yang sama secara bersamaan
            (misal Violin slotnya 1, Contrabass bisa diset 2). Diatur per tipe
            di Settings, Ketua (atau Overlord) doang yang bisa ubah.
          </li>
          <li>
            <strong>Ongoing</strong> — sebutan buat loan yang udah di-carry
            lewat Transfer to Ongoing, biasanya dipakai buat misahin
            &quot;peminjam lama&quot; dari batch intake baru.
          </li>
        </ul>
      </TaskCard>

      <TaskCard title="Kontak">
        <p>
          Bug atau ada yang aneh di sistemnya (bukan pertanyaan cara pakai):
          buka issue di GitHub <code>mahawaditra/baton</code>, atau hubungi
          Zenka langsung.
        </p>
        <p>
          Kalo gak tau cara kontak Zenka gimana, ada button website pribadi gw
          di &quot;Why is this a Thing?&quot; section di homepage BATON. Di situ
          ada medsos gw.
        </p>
        <p>
          Pertanyaan operasional dari peminjam yang nggak kejawab di FAQ: arahin
          ke Ketua Logistik OSUI Mahawaditra.
        </p>
      </TaskCard>
    </div>
  );
}
