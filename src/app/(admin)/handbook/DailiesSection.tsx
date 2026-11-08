import { HandbookCallout } from "./HandbookCallout";
import {
  DocumentChecklist,
  RecipeCard,
  RecipeNote,
  RecipeRow,
  RecipeSteps,
} from "./RecipeCard";

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

      <RecipeCard
        step={1}
        title="Proses request baru"
        href="/requests"
        hrefLabel="Buka Requests"
      >
        <RecipeRow label="Kapan">Ada request berstatus Diajukan.</RecipeRow>
        <RecipeRow label="Langkah">
          <RecipeSteps
            steps={[
              "Cek jenis instrumen yang diminta.",
              "Lihat ketersediaan di Instruments.",
              "Ada yang cocok? Assign dari detail request-nya.",
              "Nggak ada yang cocok? Reject aja, kasih alasan singkat — nanti otomatis ke-email ke peminjam.",
            ]}
          />
        </RecipeRow>
        <RecipeNote>
          Lebih enak lihat per tahap? Pindah ke tampilan Board (tombol di
          samping kolom search). Kartu berlabel kuning artinya nunggu kalian,
          yang abu-abu nunggu peminjam.
        </RecipeNote>
      </RecipeCard>

      <RecipeCard
        step={2}
        title="Review dokumen"
        href="/requests"
        hrefLabel="Buka Requests"
      >
        <RecipeRow label="Kapan">
          Peminjam udah upload dokumen. Tiap dokumen diperiksa satu-satu, bukan
          sekaligus.
        </RecipeRow>
        <DocumentChecklist
          items={[
            {
              title: "Kontrak tanda tangan",
              checks: ["Tanda tangan lengkap", "Materai ada"],
            },
            {
              title: "Bukti deposit",
              checks: ["Nominal cocok", "Rekening tujuan cocok sama Settings"],
            },
            {
              title: "KTP",
              checks: ["Kebaca jelas", "Nama & data cocok sama form"],
            },
          ]}
        />
        <RecipeNote>
          Kalau ada yang nggak sesuai, reject dokumen itu aja (bukan semuanya) —
          peminjam upload ulang yang itu doang.
        </RecipeNote>
      </RecipeCard>

      <RecipeCard step={3} title="Serah terima di Sekre">
        <RecipeRow label="Kapan">Dokumen udah di-approve semua.</RecipeRow>
        <RecipeRow label="Langkah">
          <RecipeSteps
            steps={[
              "SEHARUSNYA kalo kalian udah assign instrument ke peminjam, instrumennya juga udah disiapin di Sekre — JANGAN MALES, jangan nunggu peminjam yang minta-minta.",
              "Peminjam nanti akan hubungi ketua logistik, atau lebih baiknya lagi kalian yang udah approve dokumen langsung aja hubungi si peminjamnya proactively, terus janjian kapan bisa ambil.",
              "Pas dia dateng ke Sekre, suruh aja di tempat, lu suruh dia isi woy addendum kondisi awal + foto.",
              "Kalo udah oke, Confirm Handover di BATON. Instrumen resmi jadi tanggung jawab dia.",
            ]}
          />
        </RecipeRow>
        <HandbookCallout>
          HARUS ADA staf yang saksi si peminjam ambil instrumen. Confirm
          Handover juga nggak bakal bisa sebelum addendum awal masuk.
        </HandbookCallout>
      </RecipeCard>

      <RecipeCard
        step={4}
        title="Proses perpanjangan"
        href="/requests"
        hrefLabel="Buka Requests"
      >
        <RecipeRow label="Kapan">
          Button extend di status page peminjam baru muncul mulai 30 hari
          sebelum due date.
        </RecipeRow>
        <RecipeRow label="Langkah">
          <RecipeSteps
            steps={[
              "Peminjam cek ulang data mereka, lalu generate kontrak perpanjangan beserta checkpoint addendum.",
              "Review kontrak tanda tangannya aja — bukti deposit sama KTP nggak diminta lagi.",
              "Confirm Extension, biar keitung di Ongoing Loans dengan latest due date.",
            ]}
          />
        </RecipeRow>
        <RecipeNote>
          Begitu peminjam udah kirim addendum akhir, button extend hilang dan
          nggak bisa diperpanjang lagi. Kalau dia berubah pikiran, bikin tiket
          baru aja.
        </RecipeNote>
      </RecipeCard>

      <RecipeCard
        step={5}
        title="Proses pengembalian"
        href="/requests"
        hrefLabel="Buka Requests"
      >
        <RecipeRow label="Kapan">Addendum akhir udah masuk.</RecipeRow>
        <RecipeRow label="Langkah">
          <RecipeSteps
            steps={[
              "Cek addendum kondisi akhir yang diisi peminjam, bandingin sama kondisi awal.",
              "Confirm Return. Kalau instrumennya lagi di-share dan masih ada peminjam lain, lu cuma nutup peminjaman orang itu doang.",
            ]}
          />
        </RecipeRow>
        <RecipeNote>
          Refund deposit nggak perlu dihitung manual: BATON yang ngitung pas
          confirm return, tepat waktu penuh, telat dalam grace days parsial,
          lewat dari itu hangus. Nominalnya otomatis ke-email ke peminjam dan
          kecatat di Archive. Urusan balikin duitnya ke bendahara, bukan
          Logistik.
        </RecipeNote>
        <p className="text-caption">
          Setelah addendum akhir masuk, peminjam juga bisa isi survey di status
          page-nya, dan link-nya ikut di email konfirmasi. Kalian nggak perlu
          ngapa-ngapain buat ini.
        </p>
      </RecipeCard>
    </div>
  );
}
