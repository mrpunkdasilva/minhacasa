import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { userRepository } from "@/app/infra/lib/user.repository";
import { comparePassword } from "@/app/infra/lib/password";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await userRepository.findByEmail(email);
          if (!user) return null;

          const passwordsMatch = await comparePassword(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.avatarUrl,
              houseId: user.houseId,
            } as any;
          }
        }

        console.log("Invalid credentials for email:", credentials?.email);
        return null;
      },
    }),
  ],
});
