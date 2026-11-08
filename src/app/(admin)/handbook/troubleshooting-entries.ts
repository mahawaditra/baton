export type TroubleshootingOwner = "self" | "ketua" | "zenka";

export type TroubleshootingEntry = {
  id: string;
  title: string;
  owner: TroubleshootingOwner;
  incidentDate?: string;
  why: string[];
  steps: string[];
  note?: string;
  warning?: string;
};

export type TroubleshootingGroup = {
  label: string;
  entries: TroubleshootingEntry[];
};

export const TROUBLESHOOTING_OWNER_LABELS: Record<
  TroubleshootingOwner,
  string
> = {
  self: "Bisa sendiri",
  ketua: "Ketua",
  zenka: "Hubungi Zenka",
};

export const TROUBLESHOOTING_GROUPS: TroubleshootingGroup[] = [
  {
    label: "Peminjam",
    entries: [
      {
        id: "perpanjang-hilang",
        title: "Tombol Perpanjang peminjam tiba-tiba hilang",
        owner: "self",
        why: [
          "Paling sering karena peminjam udah kirim addendum akhir. Itu disengaja: begitu addendum akhir masuk, peminjaman nggak bisa diperpanjang lagi.",
          "Sebabnya bisa juga karena belum masuk 30 hari sebelum due date, due date-nya udah lewat, atau perpanjangan sebelumnya masih nunggu confirm kalian.",
        ],
        steps: [
          "Cek status tiketnya di Requests.",
          "Kalau peminjamnya berubah pikiran setelah addendum akhir: nggak ada tombol buat batalin addendum, jadi selesaikan pengembaliannya.",
          "Terus dia bikin tiket baru aja.",
        ],
      },
      {
        id: "terlalu-banyak-percobaan",
        title: 'Peminjam kena "Terlalu banyak percobaan"',
        owner: "self",
        why: [
          "Muncul setelah 5 kali salah masukin kode akses dalam 10 menit. Kode yang bener tetep bisa dipakai walaupun pesan ini lagi muncul.",
        ],
        steps: [
          "Suruh cek lagi kodenya di email konfirmasi pas pengajuan.",
          "Kalau masih salah, tunggu beberapa menit.",
        ],
      },
      {
        id: "download-kontrak",
        title: 'Tombol "Download Kontrak" nggak kerespon di HP',
        owner: "self",
        incidentDate: "Sep 2026",
        why: ["Biasanya jaringan goyang pas mobile Safari."],
        steps: [
          "Minta peminjam coba lagi, biasanya langsung jalan.",
          "Kalau masih gagal terus, minta screenshot, kirim ke Zenka.",
        ],
      },
      {
        id: "fakultas-jurusan",
        title: "Peminjam nggak bisa isi Fakultas/Jurusan",
        owner: "zenka",
        incidentDate: "Sep 2026",
        why: [
          "Udah dibenerin — sekarang 2 kotak terpisah (Fakultas, Jurusan/Prodi).",
        ],
        steps: [
          "Kalau masih ada yang gagal isi field ini, screenshot errornya, kirim ke Zenka.",
        ],
      },
      {
        id: "foto-addendum",
        title: "Foto hasil addendum corrupt, kepotong, atau rusak",
        owner: "zenka",
        incidentDate: "Sep 2026",
        why: [
          "Kejadian 24/09/2026: dari 5 foto Addendum Awal yang di-upload peminjam, cuma 1 yang berhasil, 4 sisanya corrupt (gambarnya kepotong).",
          "Secara internal, 1 foto yang selamat itu masih worth using. Tapi dari sisi peminjam, itu bukti legal barang yang mereka pinjam dan berguna as their defense kalo kenapa-napa.",
        ],
        steps: [
          "Jangan lupa minta maaf dulu yes ke mereka (dan gw juga minta maap).",
          "Minta fotonya lagi secara informal, lewat LINE.",
          "Kirim ke gw, nanti gw replace fotonya di Drive pakai script supaya seamless buat kalian dan peminjam.",
        ],
        warning:
          "DO NOT ATTEMPT TO DELETE/REPLACE THE PHOTO IN THE DRIVE FOLDER YOURSELF. Itu bakal merusak peminjamannya di sistem. Butuh script khusus untuk replace isi suatu file di Drive.",
      },
    ],
  },
  {
    label: "Instrumen",
    entries: [
      {
        id: "nggak-muncul-di-assign",
        title: "Instrumen yang mau dipinjamkan nggak muncul di Assign",
        owner: "self",
        why: [
          "Bagian Assign cuma muncul kalau request-nya masih Diajukan atau Ditinjau dan instrumennya belum dikonfirmasi. Di dalamnya, sebuah instrumen cuma muncul kalau SEMUA syarat di bawah kepenuhi.",
        ],
        steps: [
          "Buka Instruments, cari unitnya, terus cek detailnya satu-satu.",
          "Status bukan Ditempatkan atau Nonaktif.",
          "Condition Baik atau Perlu Perbaikan, bukan Pensiun atau Hilang.",
          "Loanable nyala.",
          'Nama tipenya mengandung jenis yang diminta peminjam, misal request "Trumpet" cocok ke "Trumpet Bb".',
          "Slot masih ada yang kosong. Kalau penuh dan emang mau di-share, minta Ketua naikin.",
        ],
        note: "Kalau statusnya Ditempatkan karena dipegang peminjam pre-BATON, lihat kasus pre-BATON di bawah.",
      },
      {
        id: "kondisi-terkunci",
        title: "Kondisi instrumen yang lagi dipinjem nggak bisa diubah",
        owner: "self",
        why: [
          "Sengaja. Instrumen yang lagi punya peminjam aktif (Dibooking, Dipinjam, atau dua-duanya sekaligus kalau lagi di-share) di-lock di form edit — Condition, Status, DAN Location-nya nggak bisa diubah manual sampai SEMUA peminjam aktifnya kelar (reject/cancel/return).",
        ],
        steps: [
          "Kalau ada laporan instrumen rusak SELAGI masih dipinjem, catat dulu di kolom Notes instrumennya (kolom ini tetep bisa diedit).",
          "Input kondisi aslinya pas Confirm Return.",
        ],
        note: "Intinya JANGAN BANDEL ganti-ganti kondisi dan status instrumen yang sedang dipinjam.",
      },
      {
        id: "instrumen-hilang",
        title: "Instrumen hilang atau rusak berat",
        owner: "self",
        why: [
          "Begitu Condition diubah ke Hilang atau Pensiun, Status & Loanable otomatis ke-set jadi Nonaktif / off. Ini cuma bisa kalau instrumennya lagi nggak terikat request aktif.",
        ],
        steps: [
          "Nggak terikat request aktif: buka detail instrumennya, ubah Condition ke Hilang atau Pensiun.",
          "Lagi terikat request aktif: catat di Notes instrumennya dulu, baru diproses pas return.",
          "Di laman status peminjam kita nggak sediain apa-apa buat ini, jadi arahin peminjam buat langsung hubungi Ketua Logistik.",
        ],
        note: "Memang belum ada fitur buat flow revitalisasi. Maybe one day, soalnya itu fitur besar, so selagi gw ada waktu dan ada subsidi ya boleh aja request ke gw.",
      },
      {
        id: "instrumen-di-share",
        title: "Instrumen terbatas, pemegangnya double",
        owner: "ketua",
        incidentDate: "Sep 2026",
        why: [
          "Slot per tipe instrumen diatur di Settings, bagian Instrument Availability Slots. Ketua doang yang bisa ubah, tapi semua admin bisa lihat. By default 1 slot buat semua tipe.",
          "Peminjam baru tetep isi kontrak + addendum SENDIRI, jadi kalau dia yang nyebabin kerusakan, dia sendiri yang tanggung jawab, bukan peminjam yang udah lebih dulu.",
        ],
        steps: [
          "Ketua naikin slot tipe itu (button +), misal Contrabass jadi 2. Nggak bisa diturunin lagi kalau ada unit yang lagi dipegang sejumlah itu.",
          'Instrumennya tetep muncul di assignable instruments walaupun statusnya udah "Dibooking"/"Dipinjam", jadi assign aja seperti biasa.',
          "Pas return, kondisi/status FINAL baru diminta dari peminjam yang TERAKHIR. Kalau masih ada yang megang, admin cuma nutup peminjaman orang itu doang.",
        ],
        note: 'Location di detail instrumen otomatis nunjukin gabungan nama semua peminjam aktif (contoh: "Adit (2020) & David (2020)"), jadi nggak perlu dicatet manual di Notes.',
      },
      {
        id: "pre-baton-di-share",
        title: "Instrumen peminjam pre-BATON nggak muncul di Assign",
        owner: "self",
        why: [
          "Peminjam pre-BATON (yang minjam sebelum ada BATON, namanya ditulis kayak Adit '24) nggak punya tiket di sistem. Instrumennya sementara berstatus Ditempatkan, dan Assign nyembunyiin instrumen yang statusnya Ditempatkan atau Nonaktif.",
          "Kerjain ini CUMA kalau instrumennya beneran mau di-share ke peminjam baru. Selain itu biarin aja tetep Ditempatkan.",
        ],
        steps: [
          "Pastiin slot tipe instrumen itu udah cukup. Kalau belum, minta Ketua naikin.",
          "Pindahin nama peminjamnya ke Notes instrumen, misal Adit '24 (pre-BATON).",
          "Ubah status instrumennya jadi Tersedia, nanti langsung muncul di Assign.",
          "Assign peminjam barunya seperti biasa.",
          "Kalau peminjam barunya balikin duluan padahal yang pre-BATON masih pegang: di Confirm Return, ganti Location jadi nama dia (jangan biarin Sekre), terus ubah status ke Ditempatkan lewat form edit instrumen.",
          "Kalau peminjam pre-BATON-nya udah balikin, hapus namanya dari Notes.",
        ],
        note: "Agak manual, tapi sengaja nggak dibikinin fitur karena peminjam pre-BATON nanti habis sendiri.",
        warning:
          "BATON nggak tau peminjam pre-BATON itu ada, jadi slotnya kebaca lebih longgar dari aslinya. Sebelum assign kebaca 0/2, padahal udah keisi 1. Setelah assign kebaca 1/2 dan Location cuma nunjukin peminjam baru, padahal udah penuh. Notes itu satu-satunya penanda, jadi cek Notes dulu sebelum assign biar nggak ada peminjam ketiga.",
      },
      {
        id: "salah-nambah-instrumen",
        title: "Salah nambah instrumen baru",
        owner: "self",
        why: [
          "Memang sengaja gak ada fitur delete instrument supaya nggak ada yang asal hapus, karena itu bakal bikin data historis jadi nggak konsisten.",
        ],
        steps: [
          "Kalau ada yang salah, yaudah edit aja dari detail instrumennya.",
          "Kalau yang salah itu uneditable (misal: ID, Type, atau Category), hubungi Zenka buat ubah manual di database.",
        ],
      },
    ],
  },
  {
    label: "Sistem dan akun",
    entries: [
      {
        id: "link-line",
        title: "Link LINE di landing page nggak berfungsi",
        owner: "ketua",
        incidentDate: "Sep 2026",
        why: [
          'Link "Add Friend" LINE itu BUKAN dirakit dari LINE ID biasa, tapi link/token khusus dari app LINE si ketua (Profile → QR code → Copy link). Token ini kadaluarsa kalau ketua nge-klik "Regenerate" lagi setelah link lama dipasang di Settings.',
        ],
        steps: [
          "Minta ketua buka app LINE-nya, generate ulang link Add Friend, terus copy.",
          'Paste ke field "LINE Add Friend Link" di Settings. Centang dulu "Enable LINE" kalau belum, field-nya baru muncul.',
          'Klik Save di ujung field itu, bukan "Save Loan Settings" — dua-duanya independen.',
        ],
      },
      {
        id: "undo-transfer",
        title: "Salah pencet Transfer to Ongoing buat semua loan",
        owner: "zenka",
        why: [
          'Buat 1-2 loan doang, ada tombol "Move back to active roster" di detail request-nya. Tapi kalau salah pencet buat SEMUA loan sekaligus, itu nggak ada tombolnya — butuh buka database (Supabase) langsung.',
        ],
        steps: [
          "Jangan coba-coba sendiri dari admin panel.",
          "Hubungi Zenka buat update baris-baris yang carry-over-nya salah.",
        ],
      },
      {
        id: "nambah-pengurus",
        title: "Nambahin Pengurus baru",
        owner: "zenka",
        why: [
          "Role Pengurus nggak bisa ditambahin dari UI — ini disengaja, dibuat manual di database sama Zenka. Dari Settings, Ketua cuma bisa nambahin Staff, sedangkan Pengurus bisa nambahin Staff atau Ketua.",
          "Overlord itu cuma satu, yaitu Zenka, dan nggak bakal ada yang lain.",
        ],
        steps: ["Hubungi Zenka kalau butuh akun Pengurus baru."],
      },
    ],
  },
];

export function filterTroubleshootingGroups(
  groups: TroubleshootingGroup[],
  query: string,
  owner: TroubleshootingOwner | "all",
): TroubleshootingGroup[] {
  const normalizedQuery = query.trim().toLowerCase();

  return groups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) => {
        if (owner !== "all" && entry.owner !== owner) return false;
        if (!normalizedQuery) return true;
        return [
          entry.title,
          ...entry.why,
          ...entry.steps,
          entry.note ?? "",
          entry.warning ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    }))
    .filter((group) => group.entries.length > 0);
}
