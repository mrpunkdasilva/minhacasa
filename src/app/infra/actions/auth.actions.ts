"use server";

import { signIn, signOut as authSignOut } from "@/auth";
import { AuthError } from "next-auth";
import { userRepository } from "@/app/infra/lib/user.repository";
import { houseRepository } from "@/app/infra/lib/house.repository";
import { hashPassword } from "@/app/infra/lib/password";
import { UserEntity } from "@/app/domain/entity/user/user.entity";
import { HouseEntity } from "@/app/domain/entity/house/house.entity";

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
  const inviteCode = formData.get("inviteCode") as string;

  if (!name || !email || !password) {
    return "Por favor, preencha todos os campos para entrar na sua casa.";
  }

  try {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return "Este e-mail já tem uma casa registrada por aqui.";
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();
    let houseId = "";

    // Join an existing house via invite code
    if (inviteCode) {
      const house = await houseRepository.findByInviteCode(inviteCode);
      if (!house) {
        return "Ops! Esse código de convite parece não existir mais.";
      }
      houseId = house.id;
    } else {
      // Create a new house for the first resident
      houseId = crypto.randomUUID();
      const newHouse: HouseEntity = {
        id: houseId,
        name: `Casa de ${name.split(" ")[0]}`,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await houseRepository.create(newHouse);
    }

    const newUser: UserEntity = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      houseId,
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
