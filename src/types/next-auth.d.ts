import type { DefaultSession } from "next-auth";

/**
 * Module augmentation for the fields this app puts on the session.
 *
 * Without it, `session.user.houseId` and `user.houseId` are untyped, which
 * forces every consumer to cast through `any`. Declaring them here keeps the
 * tenant boundary (`houseId` scopes every repository query) type-safe end to
 * end, and lets the auth callbacks return the user object with no cast.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      houseId: string;
    } & DefaultSession["user"];
  }

  interface User {
    houseId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    houseId?: string;
  }
}
