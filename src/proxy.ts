import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ADMIN_HOST, isAdminHost } from "@/lib/admin/admin-host";

const ADMIN_PATH_SEGMENTS = new Set([
  "dashboard",
  "requests",
  "instruments",
  "goods",
  "archive",
  "activity",
  "reports",
  "settings",
  "handbook",
  "login",
  "documents",
  "drive-files",
]);

function bounceToAdminHost(req: NextRequest): NextResponse | undefined {
  if (!ADMIN_HOST) return undefined;

  const { pathname, search } = req.nextUrl;

  let target: string | undefined;
  if (pathname === "/limbo") {
    target = "/limbo";
  } else if (pathname === "/admin" || pathname === "/admin/dashboard") {
    target = "/";
  } else if (pathname.startsWith("/admin/")) {
    target = pathname.slice("/admin".length);
  } else if (ADMIN_PATH_SEGMENTS.has(pathname.split("/")[1] ?? "")) {
    target = pathname;
  }

  if (!target) return undefined;
  return NextResponse.redirect(
    new URL(`https://${ADMIN_HOST}${target}${search}`),
    301,
  );
}

async function handleAdminHost(
  req: NextRequest,
  origin: string,
): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session || !session.user.isActive) {
    if (pathname === "/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", origin));
  }

  if (session.user.handoverAt) {
    if (pathname === "/limbo") return NextResponse.next();
    return NextResponse.redirect(new URL("/limbo", origin));
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", origin));
  }

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/dashboard", origin));
  }

  return NextResponse.next();
}

export default async function proxy(req: NextRequest) {
  const rawHost = req.headers.get("host");

  if (isAdminHost(rawHost)) {
    const origin = `${req.nextUrl.protocol}//${rawHost}`;
    return handleAdminHost(req, origin);
  }

  return bounceToAdminHost(req);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icons|favicon\\.ico|robots\\.txt|manifest\\.webmanifest|monitoring|icon\\.svg|apple-icon\\.png|opengraph-image\\.png).*)",
  ],
};
