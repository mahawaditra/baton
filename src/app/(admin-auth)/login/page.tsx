import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminGoogleLogin } from "@/components/AdminGoogleLogin";

export const metadata: Metadata = {
  title: "Masuk — Admin BATON",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-6">
      <div className="flex flex-col items-center gap-2">
        <span className="h-2.5 w-10 rounded-full bg-gold" />
        <div className="font-heading text-h1 text-navy">BATON</div>
        <div className="text-micro uppercase text-muted-foreground">
          Admin — OSUI Mahawaditra
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Masuk ke BATON</CardTitle>
          <CardDescription>
            Masuk pakai akun Google admin kamu yang sudah diaktifkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminGoogleLogin />
        </CardContent>
      </Card>

      <p className="max-w-sm text-center text-caption text-foreground-2">
        Halaman ini khusus staf Logistik OSUI Mahawaditra. Kalau kamu staf
        Logistik tapi belum bisa masuk, hubungi Ketua Logistik OSUI
        Mahawaditra buat didaftarkan sebagai admin.
      </p>
    </div>
  );
}
