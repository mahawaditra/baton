import fs from "fs";
import path from "path";
import { downloadFileAsBase64 } from "@/lib/drive";

let cachedContractFonts: {
  regular: string;
  bold: string;
  italic: string;
} | null = null;

export async function getContractFonts() {
  if (cachedContractFonts) return cachedContractFonts;

  const [regular, bold, italic] = await Promise.all([
    downloadFileAsBase64(
      process.env.CONTRACT_FONT_REGULAR_DRIVE_ID!,
      "font/ttf",
    ),
    downloadFileAsBase64(process.env.CONTRACT_FONT_BOLD_DRIVE_ID!, "font/ttf"),
    downloadFileAsBase64(
      process.env.CONTRACT_FONT_ITALIC_DRIVE_ID!,
      "font/ttf",
    ),
  ]);

  cachedContractFonts = { regular, bold, italic };
  return cachedContractFonts;
}

function imageToBase64(filename: string): string {
  const filePath = path.join(process.cwd(), "src/assets/pdf", filename);
  const buffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

const headerImage = imageToBase64("header.png");
const footerImage = imageToBase64("footer.png");

export const headerTemplate = `<div style="width: 100%; margin: 0 24px;">
    <img src="${headerImage}" style="width: 100%; display: block;" />
  </div>
`;

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")},00`;
}

function formatTanggalIndo(date: Date): string {
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const tanggal = date.getDate();
  const bulanIndex = date.getMonth();
  const tahun = date.getFullYear();
  return `${tanggal} ${bulan[bulanIndex]} ${tahun}`;
}

type ContractData = {
  signatory: {
    name: string;
    phone: string;
    addressKtp: string;
    addressDomicile: string;
    faculty: string;
    year: string;
    section: string;
    ktpNumber: string;
    imageBase64: string | null;
  };
  borrower: {
    name: string;
    phone: string;
    addressKtp: string;
    addressDomicile: string;
    faculty: string;
    year: string;
    ktpNumber: string;
  };
  guardian: {
    name: string;
    phone: string;
    addressKtp: string;
  };
  instrumentLabel: string;
  instrumentType: string;
  depositAmount: number;
  depositPartialAmount: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  dueDate: Date;
};

export async function buildContractHTML(data: ContractData): Promise<string> {
  const fonts = await getContractFonts();
  const dueDateStr = formatTanggalIndo(data.dueDate);
  const todayStr = formatTanggalIndo(new Date());

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "Times New Roman";
    src: url(${fonts.regular}) format("truetype");
    font-weight: normal; font-style: normal;
  }
  @font-face {
    font-family: "Times New Roman";
    src: url(${fonts.bold}) format("truetype");
    font-weight: bold; font-style: normal;
  }
  @font-face {
    font-family: "Times New Roman";
    src: url(${fonts.italic}) format("truetype");
    font-weight: normal; font-style: italic;
  }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; }
  h1 { text-align: center; font-size: 14pt; margin-bottom: 24px; }
  h2 { text-align: center; font-size: 12pt; margin: 24px 0 4px; }
  h3 { text-align: center; font-size: 12pt; margin: 0 0 16px; font-weight: normal; }
  .field-row { display: flex; margin-bottom: 2px; }
  .field-label { width: 160px; flex-shrink: 0; }
  .field-colon { width: 12px; flex-shrink: 0; }
  .field-value { flex: 1; }
  .party-block { margin-bottom: 16px; }
  ol { padding-left: 20px; }
  ol li { margin-bottom: 10px; text-align: justify; }
  .signature-block { display: flex; justify-content: space-between; margin-top: 40px; }
  .signature-col { width: 45%; text-align: center; }
  .signature-img { height: 60px; margin: 8px auto; display: block; }
  .signature-line { height: 60px; margin: 8px 0; }
</style>
</head>
<body>

<h1>KONTRAK PEMINJAMAN ALAT</h1>
<p>Pada tanggal ${todayStr}, kami yang bertanda tangan di bawah ini :</p>

<div class="party-block">
  <div class="field-row"><div class="field-label">Nama</div><div class="field-colon">:</div><div class="field-value">${data.signatory.name}</div></div>
  <div class="field-row"><div class="field-label">No. Telepon/Ponsel</div><div class="field-colon">:</div><div class="field-value">${data.signatory.phone}</div></div>
  <div class="field-row"><div class="field-label">Alamat sesuai KTP</div><div class="field-colon">:</div><div class="field-value">${data.signatory.addressKtp}</div></div>
  <div class="field-row"><div class="field-label">Alamat domisili</div><div class="field-colon">:</div><div class="field-value">${data.signatory.addressDomicile}</div></div>
  <div class="field-row"><div class="field-label">Fakultas/Jurusan</div><div class="field-colon">:</div><div class="field-value">${data.signatory.faculty}</div></div>
  <div class="field-row"><div class="field-label">Angkatan UI/OSUI</div><div class="field-colon">:</div><div class="field-value">${data.signatory.year}</div></div>
  <div class="field-row"><div class="field-label">Section/Instrumen</div><div class="field-colon">:</div><div class="field-value">${data.signatory.section}</div></div>
  <div class="field-row"><div class="field-label">Nomor KTP</div><div class="field-colon">:</div><div class="field-value">${data.signatory.ktpNumber}</div></div>
  <p>Dalam hal ini bertindak untuk dan atas nama OSUI Mahawaditra dalam kapasitasnya sebagai kepala divisi perlengkapan yang selanjutnya disebut sebagai <b>PIHAK PERTAMA</b></p>
</div>

<div class="party-block">
  <div class="field-row"><div class="field-label">Nama</div><div class="field-colon">:</div><div class="field-value">${data.borrower.name}</div></div>
  <div class="field-row"><div class="field-label">No. Telepon/Ponsel</div><div class="field-colon">:</div><div class="field-value">${data.borrower.phone}</div></div>
  <div class="field-row"><div class="field-label">Alamat sesuai KTP</div><div class="field-colon">:</div><div class="field-value">${data.borrower.addressKtp}</div></div>
  <div class="field-row"><div class="field-label">Alamat domisili</div><div class="field-colon">:</div><div class="field-value">${data.borrower.addressDomicile}</div></div>
  <div class="field-row"><div class="field-label">Fakultas/Jurusan</div><div class="field-colon">:</div><div class="field-value">${data.borrower.faculty}</div></div>
  <div class="field-row"><div class="field-label">Angkatan UI/OSUI</div><div class="field-colon">:</div><div class="field-value">${data.borrower.year}</div></div>
  <div class="field-row"><div class="field-label">Section/Instrumen</div><div class="field-colon">:</div><div class="field-value">${data.instrumentLabel}</div></div>
  <div class="field-row"><div class="field-label">Nomor KTP</div><div class="field-colon">:</div><div class="field-value">${data.borrower.ktpNumber}</div></div>
  <p>Dalam hal ini bertindak untuk dan atas nama sendiri yang selanjutnya disebut sebagai <b>PIHAK KEDUA</b></p>
</div>

<div class="party-block">
  <div class="field-row"><div class="field-label">Nama</div><div class="field-colon">:</div><div class="field-value">${data.guardian.name}</div></div>
  <div class="field-row"><div class="field-label">No. Telepon/Ponsel</div><div class="field-colon">:</div><div class="field-value">${data.guardian.phone}</div></div>
  <div class="field-row"><div class="field-label">Alamat sesuai KTP</div><div class="field-colon">:</div><div class="field-value">${data.guardian.addressKtp}</div></div>
  <p>Dalam hal ini bertindak untuk dan atas nama <b>PIHAK KEDUA</b> sebagai wali/orang tua dari <b>PIHAK KEDUA</b>.</p>
</div>

<p><b>PIHAK PERTAMA</b> dan <b>PIHAK KEDUA</b> secara bersama-sama disebut "<b>PARA PIHAK</b>" dan secara sendiri-sendiri disebut "<b>PIHAK</b>".<br/>
<b>PARA PIHAK</b> setuju untuk melakukan perjanjian dengan ketentuan berikut:</p>

<div style="page-break-before: always;"></div>

<h2>PASAL 1</h2>
<h3>KETENTUAN UMUM</h3>
<ol>
  <li>INSTRUMEN adalah alat musik ${data.instrumentType} milik OSUI Mahawaditra dengan ciri-ciri yang akan dijelaskan selanjutnya dalam Addendum Perjanjian.</li>
  <li>PIHAK PERTAMA mewakili OSUI Mahawaditra adalah kepala divisi perlengkapan OSUI Mahawaditra sebagai penanggung jawab dalam peminjaman INSTRUMEN kepada PIHAK KEDUA.</li>
  <li>PIHAK KEDUA adalah calon anggota aktif/anggota aktif OSUI Mahawaditra yang bermaksud untuk meminjam instrumen milik OSUI Mahawaditra dan disetujui oleh PIHAK PERTAMA.</li>
  <li>DEPOSIT adalah uang sebesar ${formatRupiah(data.depositAmount)} yang diberikan oleh PIHAK KEDUA kepada PIHAK PERTAMA sebelum surat ini ditandatangani sebagai jaminan agar PIHAK KEDUA mengembalikan INSTRUMEN tepat pada waktunya. DEPOSIT akan dikembalikan pada saat INSTRUMEN dikembalikan.</li>
  <li>DEPOSIT telah ditransfer ke rekening bank ${data.bankName} dengan nomor <b>${data.bankAccount} atas nama ${data.bankHolder}</b>.</li>
</ol>

<h2>PASAL 2</h2>
<h3>MASA PEMINJAMAN</h3>
<ol>
  <li>Peminjaman dimulai sejak PARA PIHAK menandatangani surat perjanjian hingga tanggal <b>${dueDateStr}</b>.</li>
  <li>Apabila sebelum masa peminjaman berakhir, terdapat perubahan status keanggotaan PIHAK KEDUA, maka peminjaman dapat dihentikan oleh PIHAK PERTAMA.</li>
  <li>Perubahan status keanggotaan sebagaimana dimaksud pada ayat (2) termasuk, namun tidak terbatas pada pengunduran diri, menjadi anggota pasif OSUI Mahawaditra, pemutihan status keanggotaan, dan cuti.</li>
  <li>PIHAK PERTAMA dapat sewaktu-waktu menghentikan masa peminjaman sebelum waktu yang dimaksud pada ayat (1) secara sepihak.</li>
  <li>Bila PIHAK KEDUA terlambat dalam mengembalikan INSTRUMEN sebelum atau saat selesainya masa peminjaman pada ayat (1), DEPOSIT akan dikembalikan sebanyak ${formatRupiah(data.depositAmount)}.</li>
  <li>Bila PIHAK KEDUA terlambat dalam mengembalikan INSTRUMEN maksimal 14 hari dari selesainya masa peminjaman, DEPOSIT hanya akan dikembalikan sebanyak ${formatRupiah(data.depositPartialAmount)}.</li>
  <li>Bila PIHAK KEDUA terlambat dalam mengembalikan INSTRUMEN setelah 14 hari dari selesainya masa peminjaman, DEPOSIT tidak akan dikembalikan.</li>
</ol>

<div style="page-break-before: always;"></div>

<h2>PASAL 3</h2>
<h3>PERALIHAN DAN PENGGUNAAN</h3>
<ol>
  <li>Selama jangka waktu peminjaman sebagaimana dimaksud pada PASAL 2, PIHAK KEDUA tidak diperbolehkan memindahkan hak peminjaman INSTRUMEN, kecuali dengan persetujuan PIHAK PERTAMA.</li>
  <li>INSTRUMEN menjadi tanggung jawab PIHAK KEDUA selama masa peminjaman.</li>
  <li>Penggunaan INSTRUMEN hanya diperbolehkan untuk kepentingan kegiatan OSUI Mahawaditra, termasuk latihan secara pribadi maupun berkelompok, acara internal OSUI Mahawaditra, dan penampilan OSUI Mahawaditra.</li>
  <li>Penggunaan INSTRUMEN selain yang dimaksud pada ayat (3) hanya dapat dilakukan dengan izin tertulis ketua atau wakil ketua OSUI Mahawaditra.</li>
  <li>Apabila terjadi pelanggaran ayat (4), PIHAK KEDUA akan dikenakan sanksi berupa denda paling banyak Rp1.000.000,00 (satu juta rupiah) dan terminasi peminjaman alat.</li>
</ol>

<h2>PASAL 4</h2>
<h3>KEWAJIBAN PIHAK KEDUA</h3>
<ol>
  <li>PIHAK KEDUA wajib menjaga dan merawat INSTRUMEN milik OSUI Mahawaditra secara rutin.</li>
  <li>PIHAK KEDUA wajib mendapatkan persetujuan PIHAK PERTAMA apabila hendak melakukan perbaikan atau penggantian <i>part</i> INSTRUMEN.</li>
  <li>Kehilangan, kerusakan, ataupun kekurangan akibat PIHAK KEDUA yang tidak dapat diperbaiki oleh PIHAK KEDUA, wajib diganti oleh PIHAK KEDUA dengan merek yang sama/setara/lebih baik dari INSTRUMEN yang dipinjam.</li>
</ol>

<div style="page-break-before: always;"></div>

<h2>PASAL 5</h2>
<h3>KETENTUAN-KETENTUAN LAIN</h3>
<ol>
  <li>Hal-hal yang belum diatur dalam perjanjian ini akan dibicarakan dan diselesaikan lebih lanjut oleh para pihak dan dituangkan dalam Adendum Perjanjian.</li>
  <li>Perjanjian ini tidak akan berakhir dengan berubahnya posisi PIHAK PERTAMA sebagai kepala divisi perlengkapan OSUI Mahawaditra. Dalam hal ini, perjanjian akan diteruskan dengan kepala divisi perlengkapan OSUI Mahawaditra yang berikutnya sebagai pengganti PIHAK PERTAMA.</li>
  <li>Setiap perselisihan dan perbedaan pendapat yang timbul di antara para pihak di dalam menafsirkan dan/atau melaksanakan perjanjian ini akan diselesaikan secara musyawarah dan kekeluargaan untuk mencapai permufakatan.</li>
  <li>Apabila mufakat sebagaimana yang dimaksud pada ayat (3) tidak tercapai, PARA PIHAK sepakat untuk menyelesaikan perselisihan tersebut melalui pengadilan sesuai dengan ketentuan yang berlaku.</li>
</ol>

<p>Perihal Perjanjian ini dan segala akibat serta pelaksanaannya, PARA PIHAK sepakat untuk memilih domisili hukum yang tetap dan seumumnya pada Kantor Kepaniteraan Pengadilan Negeri Depok di Depok.</p>

<p style="text-align: right; margin-top: 24px;">Depok, ${todayStr}</p>

<div class="signature-block">
  <div class="signature-col">
    <p>PIHAK PERTAMA</p>
    ${data.signatory.imageBase64 ? `<img class="signature-img" src="${data.signatory.imageBase64}" />` : `<div style="height:60px"></div>`}
    <p>${data.signatory.name}</p>
  </div>
  <div class="signature-col">
    <p>PIHAK KEDUA</p>
    <div class="signature-line"></div>
    <p>(${data.borrower.name})</p>
  </div>
</div>

<div style="page-break-inside: avoid;">
  <p style="text-align: center; margin-top: 24px;">Mengetahui, wali / orang tua PIHAK KEDUA</p>
  <p style="text-align: center; margin-top: 40px;">Materai 10000</p>
  <p style="text-align: center;">(${data.guardian.name})</p>
</div>

</body>
</html>
`;
}
export const footerTemplate = `
  <div style="width: 100%; margin: 0 24px;">
    <img src="${footerImage}" style="width: 100%; display: block;" />
  </div>
`;

const REMOTE_CHROMIUM_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar";

export async function getBrowser() {
  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(REMOTE_CHROMIUM_URL),
      headless: true,
    });
  }
  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({ headless: true });
}
