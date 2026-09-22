import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// (main)配下（ホーム・ルーレット・家事リスト・履歴）は未ログインだと使えないようにする。
const PUBLIC_PATHS = ["/login", "/signup"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!req.auth && !isPublic && pathname !== "/") {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth && isPublic) {
    const homeUrl = new URL("/home", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.svg|icons.svg).*)"],
};
