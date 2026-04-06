import { NextRequest, NextResponse } from "next/server";

const sessionCookieName = "ma_session";

export function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;

     // Allow auth endpoints and static assets through.
     if (
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon")
     ) {
          return NextResponse.next();
     }

     const token = request.cookies.get(sessionCookieName)?.value;
     const isLoggedIn = Boolean(token);

     const isProtectedPage = pathname.startsWith("/master");
     const isProtectedApi = pathname.startsWith("/api/master");
     const isLoginPage = pathname === "/login";

     if ((isProtectedPage || isProtectedApi) && !isLoggedIn) {
          if (isProtectedApi) {
               return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
          }
          const loginUrl = new URL("/login", request.url);
          return NextResponse.redirect(loginUrl);
     }

     if (isLoginPage && isLoggedIn) {
          const homeUrl = new URL("/", request.url);
          return NextResponse.redirect(homeUrl);
     }

     return NextResponse.next();
}

export const config = {
     matcher: ["/master/:path*", "/api/master/:path*", "/login"],
};
