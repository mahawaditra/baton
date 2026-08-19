"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { useMounted } from "@/lib/use-mounted";
import {
  LayoutDashboard,
  FileText,
  Boxes,
  Package,
  Activity,
  FileBarChart,
  Archive,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Operations",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      {
        href: "/admin/requests",
        label: "Requests",
        icon: FileText,
        showBadge: true,
      },
      { href: "/admin/instruments", label: "Instruments", icon: Boxes },
      { href: "/admin/goods", label: "Goods", icon: Package },
      { href: "/admin/activity", label: "Activity", icon: Activity },
      { href: "/admin/reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/archive", label: "Archive", icon: Archive },
      { href: "/admin/settings", label: "Settings", icon: Settings },
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

function BrandMark() {
  return (
    <div className="flex items-center gap-2 px-2">
      <span className="h-6 w-2 rounded-sm bg-gold" />
      <div>
        <div className="text-base font-extrabold tracking-tight">BATON</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Admin
        </div>
      </div>
    </div>
  );
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
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
  }

  async function handleLogout() {
    await authClient.signOut();
    router.refresh();
    router.push("/admin/login");
  }

  const isDark = mounted && resolvedTheme === "dark";

  const activeLabel =
    NAV_GROUPS.flatMap((group) => group.items).find((item) =>
      isActive(pathname, item.href),
    )?.label ?? "Admin";

  const navGroups = (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
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
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-micro text-background">
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
  );

  const userFooter = (
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
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border bg-sidebar p-4 lg:flex">
        <BrandMark />
        {navGroups}
        {userFooter}
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Trigger
            aria-label="Open menu"
            className="-ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded text-foreground"
          >
            <Menu className="h-[22px] w-[22px]" strokeWidth={1.75} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-[oklch(0.185_0.028_285_/_0.55)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <Dialog.Popup className="fixed top-0 bottom-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col border-r border-border bg-surface shadow-lg data-open:animate-in data-open:slide-in-from-left data-open:duration-200 data-closed:animate-out data-closed:slide-out-to-left data-closed:duration-200">
              <div className="flex items-center gap-2.5 border-b border-border p-4">
                <BrandMark />
                <Dialog.Close
                  aria-label="Close menu"
                  className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-foreground"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {navGroups}

                <div className="mt-4 border-t border-border pt-3">
                  <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Appearance
                  </div>
                  {mounted && (
                    <button
                      type="button"
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
                    >
                      {isDark ? (
                        <Sun
                          className="h-[18px] w-[18px]"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <Moon
                          className="h-[18px] w-[18px]"
                          strokeWidth={1.75}
                        />
                      )}
                      {isDark ? "Switch to light mode" : "Switch to dark mode"}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4">{userFooter}</div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>

        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Admin
          </div>
          <div className="truncate text-title font-semibold">
            {activeLabel}
          </div>
        </div>

        <div id="admin-header-action" className="shrink-0" />
      </header>
    </>
  );
}
