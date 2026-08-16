"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  FileText,
  Boxes,
  Package,
  Activity,
  FileBarChart,
  Archive,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Operasional",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      {
        href: "/admin/requests",
        label: "Peminjaman",
        icon: FileText,
        showBadge: true,
      },
      { href: "/admin/instruments", label: "Instrumen", icon: Boxes },
      { href: "/admin/goods", label: "Barang", icon: Package },
      { href: "/admin/activity", label: "Aktivitas", icon: Activity },
      { href: "/admin/reports", label: "Laporan", icon: FileBarChart },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/admin/archive", label: "Arsip", icon: Archive },
      { href: "/admin/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type AdminNavProps = {
  pendingCount: number;
  adminName: string;
  adminEmail: string;
};

export function AdminNav({
  pendingCount,
  adminName,
  adminEmail,
}: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/admin/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-sidebar p-4">
      <div className="flex items-center gap-2 px-2">
        <span className="h-6 w-2 rounded-sm bg-gold" />
        <div>
          <div className="text-base font-extrabold tracking-tight">BATON</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Admin
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded px-3 py-2 text-sm",
                      active
                        ? "bg-gold-soft/40 font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    {item.label}
                    {item.showBadge && pendingCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-background">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-border pt-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum text-xs font-semibold text-background">
          {getInitials(adminName || "?")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{adminName}</div>
          <div className="truncate text-xs text-muted-foreground">
            {adminEmail}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
