"use server";

import { signIn, signOut as authSignOut } from "@/auth";
import { AuthError } from "next-auth";
import { userRepository } from "@/app/infra/lib/user.repository";
import { hashPassword } from "@/app/infra/lib/password";
import { UserEntity } from "@/app/domain/entity/user/user.entity";

/**
 * Handles user authentication (login).
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "E-mail ou senha incorretos. Tente de novo, meu bem.";
        default:
          return "Ops! Algo deu errado na autenticação. Tente novamente.";
      }
    }
    throw error;
  }
}

/**
 * Handles new user registration.
 */
export async function registerUser(
  prevState: string | undefined,
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return "Por favor, preencha todos os campos para entrar na sua casa.";
  }

  try {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return "Este e-mail já tem uma casa registrada por aqui.";
    }

    const hashedPassword = await hashPassword(password);
    const newUser: UserEntity = {
      uuid: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userRepository.create(newUser);

    // Auto sign in after registration
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    // Rethrow to allow Next.js to handle redirects
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Registration error:", error);
    return "Não conseguimos criar sua casa agora. Tente mais tarde, meu bem.";
  }
}

/**
 * Handles user sign out.
 */
export async function signOut() {
  await authSignOut({ redirectTo: "/welcome" });
}
