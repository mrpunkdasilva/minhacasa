import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Matche all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - assets (public assets)
  // - icon.png, favicon.ico, etc.
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|icon.png|.*\\.svg$).*)",
  ],
};
