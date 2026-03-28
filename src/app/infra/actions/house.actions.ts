"use server";

import { auth } from "@/auth";
import { houseRepository } from "@/app/infra/lib/house.repository";
import { userRepository } from "@/app/infra/lib/user.repository";

/**
 * Gets the current user's house information.
 */
export async function getCurrentHouse() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseUuid) return null;

  return houseRepository.findByUuid(user.houseUuid);
}

/**
 * Generates the full invitation link for the current house.
 */
export async function getInviteLink() {
  const house = await getCurrentHouse();
  if (!house) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/welcome?invite=${house.inviteCode}`;
}
