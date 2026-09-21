import { ShieldCog, ShieldKeyhole, ShieldPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminRole } from "@/generated/prisma/client";
import { getRoleLabel } from "@/lib/labels";

const ROLE_BADGES: Record<AdminRole, { icon: LucideIcon; className: string } | null> = {
  staff: null,
  ketua: { icon: ShieldPlus, className: "bg-info-soft text-info-soft-foreground" },
  pengurus: { icon: ShieldKeyhole, className: "bg-plum-soft text-plum" },
  overlord: { icon: ShieldCog, className: "bg-gold-soft text-gold-soft-foreground" },
};

export function RoleBadge({ role }: { role: AdminRole }) {
  const badge = ROLE_BADGES[role];
  if (!badge) return null;

  const Icon = badge.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro ${badge.className}`}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {getRoleLabel(role)}
    </span>
  );
}
