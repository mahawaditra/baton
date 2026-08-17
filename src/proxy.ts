import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isActiveAdmin = Boolean(session && session.user.isActive);

  if (req.nextUrl.pathname === "/admin/login") {
    if (isActiveAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!isActiveAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (req.nextUrl.pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
