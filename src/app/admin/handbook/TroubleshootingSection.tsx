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
          Sengaja supaya instrumen yang statusnya reserved (baru di-assign,
          belum di-handover) atau borrowed (lagi aktif dipinjam) di-lock di form
          edit, status dan kondisinya nggak bisa diubah lewat form biasa sampai
          requestnya kelar (reject/cancel/return).
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
          instrumennya, ubah Condition ke Lost atau Retired. Status &amp;
          Loanable otomatis ke-set jadi Unavailable / off.
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

      <TaskCard title="Undo Transfer to Ongoing yang salah pencet (massal)">
        <p>
          Buat 1-2 loan doang, ada tombol Move back to active roster&quot; di
          detail request-nya. Tapi kalau salah pencet buat SEMUA loan sekaligus,
          itu nggak ada tombolnya — butuh buka database (Supabase) langsung dan
          update baris-baris yang carry-over-nya salah. Hubungi Zenka buat ini,
          jangan coba-coba sendiri dari admin panel.
        </p>
      </TaskCard>

      <TaskCard title="Nambahin super admin baru">
        <p>
          Admin biasa nggak bisa naikin dirinya sendiri atau orang lain jadi
          super admin dari UI — ini disengaja. Sekarang yang konsisten super
          admin cuma Zenka sebagai developer BATON dan ketua Logistik tiap
          tahunnya.
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
            <strong>Reserved vs borrowed</strong> — status instrumen. Reserved =
            udah di-assign ke sebuah request tapi belum di-handover. Borrowed =
            udah di-handover, lagi beneran dipinjam.
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
