"use client";

import { authClient } from "@/lib/auth-client";
import * as Sentry from "@sentry/nextjs";

export default function LoginPage() {
  const handleLogin = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/admin/dashboard",
      },
      {
        onError: (ctx) => {
          Sentry.captureException(ctx.error);
        },
      },
    );
  };

  return (
    <div>
      <h1>Login Admin BATON</h1>
      <button onClick={handleLogin}>Login with Google</button>
      <p style={{ fontSize: "14px", color: "#888", marginTop: "16px" }}>
        Halaman ini khusus staf Logistik OSUI Mahawaditra. Kalau kamu staf
        Logistik dan belum bisa akses, hubungi Ketua Logistik OSUI untuk
        didaftarkan sebagai admin.
      </p>
    </div>
  );
}
