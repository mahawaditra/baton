import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>BATON — Base for Assets, Tools, and Orchestral Needs</h1>
      <p>
        Platform peminjaman instrumen dan barang inventaris OSUI Mahawaditra
        untuk anggota aktif.
      </p>
      <nav>
        <Link href="/request">Ajukan Peminjaman</Link>
        {" | "}
        <Link href="/status">Cek Status Peminjaman</Link>
      </nav>
    </div>
  );
}
