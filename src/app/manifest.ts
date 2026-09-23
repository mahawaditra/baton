import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isAdminHost } from "@/lib/admin/admin-host";

const ICONS: MetadataRoute.Manifest["icons"] = [
  { src: "/icons/icon-48.png", sizes: "48x48", type: "image/png", purpose: "any" },
  { src: "/icons/icon-72.png", sizes: "72x72", type: "image/png", purpose: "any" },
  { src: "/icons/icon-96.png", sizes: "96x96", type: "image/png", purpose: "any" },
  {
    src: "/icons/icon-144.png",
    sizes: "144x144",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-maskable-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "maskable",
  },
  {
    src: "/icons/icon-maskable-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
];

const SHARED: Omit<MetadataRoute.Manifest, "name" | "short_name" | "description"> = {
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "portrait",
  background_color: "#11111f",
  theme_color: "#11111f",
  lang: "id",
  categories: ["productivity", "utilities"],
  icons: ICONS,
};

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const host = (await headers()).get("host");

  if (isAdminHost(host)) {
    return {
      name: "Admin BATON — OSUI Mahawaditra",
      short_name: "Admin BATON",
      description: "Panel admin BATON untuk Logistik OSUI Mahawaditra.",
      ...SHARED,
    };
  }

  return {
    name: "BATON — Base for Assets, Tools, and Orchestral Needs",
    short_name: "BATON",
    description: "Platform peminjaman alat musik OSUI Mahawaditra.",
    ...SHARED,
  };
}
