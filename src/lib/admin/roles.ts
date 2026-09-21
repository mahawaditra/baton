import type { AdminRole } from "@/generated/prisma/client";

const ROLE_RANK: Record<AdminRole, number> = {
  staff: 1,
  ketua: 2,
  pengurus: 3,
  overlord: 4,
};

export function roleRank(role: AdminRole): number {
  return ROLE_RANK[role];
}

export function canManage(actor: AdminRole, target: AdminRole): boolean {
  return ROLE_RANK[actor] > ROLE_RANK[target];
}

export function canSetActive(
  actor: { id: string; role: AdminRole },
  target: { id: string; role: AdminRole },
): boolean {
  return actor.id !== target.id && canManage(actor.role, target.role);
}

export function canEditSettings(role: AdminRole): boolean {
  return role === "ketua" || role === "overlord";
}

export function canViewAdminManagement(role: AdminRole): boolean {
  return role !== "staff";
}

export function assignableRoles(actor: AdminRole): AdminRole[] {
  if (actor === "staff") return [];
  if (actor === "ketua") return ["staff"];
  return ["staff", "ketua"];
}
