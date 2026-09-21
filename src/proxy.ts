import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session || !session.user.isActive) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (session.user.handoverAt) {
    return NextResponse.redirect(new URL("/limbo", req.url));
  }

  if (req.nextUrl.pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
