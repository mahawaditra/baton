"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/instruments", label: "Instrumen" },
  { href: "/admin/goods", label: "Barang" },
  { href: "/admin/requests", label: "Peminjaman" },
  { href: "/admin/archive", label: "Arsip" },
  { href: "/admin/reports", label: "Laporan" },
  { href: "/admin/activity", label: "Aktivitas" },
  { href: "/admin/settings", label: "Pengaturan" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/admin/login") return null;

  async function handleLogout() {
    await authClient.signOut();
    router.push("/admin/login");
  }

  return (
    <nav
      style={{ width: "200px", borderRight: "1px solid #ddd", padding: "16px" }}
    >
      <h2>BATON</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {NAV_ITEMS.map((item) => (
          <li key={item.href} style={{ marginBottom: "8px" }}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
