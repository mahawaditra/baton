"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.26a12 12 0 0 0 0 10.8l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.6l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function AdminGoogleLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleLogin() {
    setError(null);
    setIsPending(true);
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/admin/dashboard",
      },
      {
        onError: (ctx) => {
          Sentry.captureException(ctx.error);
          setError(
            "Login gagal. Coba lagi, atau hubungi Ketua Logistik kalau masalahnya berlanjut.",
          );
          setIsPending(false);
        },
      },
    );
  }

  return (
    <div className="mt-3">
      <Button
        onClick={handleLogin}
        disabled={isPending}
        size="lg"
        className="w-full"
      >
        <GoogleIcon />
        {isPending ? "Membuka Google..." : "Masuk dengan Google"}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-destructive" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
