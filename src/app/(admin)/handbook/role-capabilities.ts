import type { AdminRole } from "@/generated/prisma/enums";
import {
  assignableRoles,
  canEditSettings,
  canManage,
  canViewAdminManagement,
} from "@/lib/admin/roles";

export const HANDBOOK_ROLES: {
  role: AdminRole;
  label: string;
  caption: string;
}[] = [
  { role: "staff", label: "Staff", caption: "Staf tahun ini" },
  { role: "ketua", label: "Ketua", caption: "Ketua Logistik" },
  { role: "pengurus", label: "Pengurus", caption: "PI, Logistik OSUI" },
  { role: "overlord", label: "Overlord", caption: "Cuma gw" },
];

export const ROLE_CAPABILITIES: {
  label: string;
  allowed: (role: AdminRole) => boolean;
}[] = [
  {
    label: "Proses request, assign, review dokumen, handover, return",
    allowed: () => true,
  },
  { label: "Baca hasil survey", allowed: () => true },
  { label: "Ubah Loan Settings dan slot instrumen", allowed: canEditSettings },
  { label: "Lihat Admin Management", allowed: canViewAdminManagement },
  {
    label: "Tambah Staff",
    allowed: (role) => assignableRoles(role).includes("staff"),
  },
  {
    label: "Tambah Ketua",
    allowed: (role) => assignableRoles(role).includes("ketua"),
  },
  {
    label: "Aktif/nonaktifin Staff",
    allowed: (role) => canManage(role, "staff"),
  },
  {
    label: "Aktif/nonaktifin Ketua",
    allowed: (role) => canManage(role, "ketua"),
  },
  {
    label: "Aktif/nonaktifin Pengurus",
    allowed: (role) => canManage(role, "pengurus"),
  },
  {
    label: "Serah terima jabatan (Handover)",
    allowed: (role) => role === "ketua",
  },
];
