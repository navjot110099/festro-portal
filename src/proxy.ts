import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "fh_session";

const PORTAL_ROUTES = [
  "/dashboard",
  "/analytics",
  "/leads",
  "/ai",
  "/seo",
  "/campaigns",
  "/services",
  "/projects",
  "/tasks",
  "/reports",
  "/support",
  "/settings",
];

/**
 * Route protection: portal pages require a session, and a signed-in visitor
 * landing on the entry page goes straight to their dashboard.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPortal = PORTAL_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isPortal && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/(dashboard|analytics|leads|ai|seo|campaigns|services|projects|tasks|reports|support|settings)/:path*",
  ],
};
