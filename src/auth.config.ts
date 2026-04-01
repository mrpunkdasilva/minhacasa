import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/welcome",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = !nextUrl.pathname.startsWith("/welcome");
      const isPublicAsset =
        nextUrl.pathname.startsWith("/api") ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname.includes(".") || // files like favicon.ico, images, etc.
        nextUrl.pathname === "/favicon.ico";

      if (isPublicAsset) return true;

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redireciona usuários não autenticados para a página de login
      } else if (isLoggedIn) {
        // Redireciona usuários logados para o dashboard se tentarem acessar /welcome
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.houseId = (user as any).houseId;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).houseId = token.houseId as string;
      }
      return session;
    },
  },
  providers: [], // Provedores serão adicionados em auth.ts para evitar problemas com bibliotecas no Edge
} satisfies NextAuthConfig;
