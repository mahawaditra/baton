"use client";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const handleLogin = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/admin/dashboard",
      },
      {
        onError: (ctx) => {
          console.log("Login error:", ctx.error);
        },
      },
    );
  };

  return (
    <div>
      <h1>Login Admin BATON</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
}
