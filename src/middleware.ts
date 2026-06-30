import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sap_session_token")?.value;
  console.log("Middleware checking path:", pathname);
  // Kiểm tra token chỉ khi cần thiết
  let isTokenValid = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      isTokenValid = true;
    } catch {
      isTokenValid = false;
    }
  }

  // Phân luồng bảo mật
  const isAuthPage = pathname === "/login";
  const isProtectedPage = pathname.startsWith("/home") || 
                          pathname.startsWith("/dashboard") || 
                          pathname.startsWith("/hr") || 
                          pathname.startsWith("/workflow");

  // Nếu là trang bảo mật mà chưa đăng nhập -> Login
  if (isProtectedPage && !isTokenValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Nếu là trang Login mà đã đăng nhập -> Dashboard
  if (isAuthPage && isTokenValid) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};