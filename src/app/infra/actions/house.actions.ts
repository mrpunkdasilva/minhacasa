"use server";

import { auth } from "@/auth";
import { houseRepository } from "@/app/infra/lib/house.repository";
import { userRepository } from "@/app/infra/lib/user.repository";
import { HouseEntity } from "@/app/domain/entity/house/house.entity";

interface ExtendedSession {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    houseId?: string;
  };
}

export async function getCurrentHouse(): Promise<HouseEntity | null> {
  const session = (await auth()) as ExtendedSession;

  if (!session?.user) {
    return null;
  }

  const sessionHouseId = session.user.houseId;
  if (sessionHouseId) {
    const house = await houseRepository.findById(sessionHouseId);
    if (house) {
      const { _id, ...cleanHouse } = house as HouseEntity & { _id?: unknown };
      return cleanHouse;
    }
  }

  const email = session.user.email;
  const userId = session.user.id;

  let user = null;
  if (email) user = await userRepository.findByEmail(email);
  if (!user && userId) user = await userRepository.findById(userId);

  if (!user) {
    return null;
  }

  if (!user.houseId) {
    const houseId = crypto.randomUUID();
    const newHouse: HouseEntity = {
      id: houseId,
      name: `Casa de ${user.name.split(" ")[0]}`,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdById: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await houseRepository.create(newHouse);
    await userRepository.update(user.id, { houseId });

    const { _id, ...cleanHouse } = newHouse as HouseEntity & { _id?: unknown };
    return cleanHouse;
  }

  const house = await houseRepository.findById(user.houseId);

  if (!house) {
    const newHouse: HouseEntity = {
      id: user.houseId,
      name: `Casa de ${user.name.split(" ")[0]}`,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdById: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await houseRepository.create(newHouse);

    const { _id, ...cleanHouse } = newHouse as HouseEntity & { _id?: unknown };
    return cleanHouse;
  }

  const { _id, ...cleanHouse } = house as HouseEntity & { _id?: unknown };
  return cleanHouse;
}

/**
 * Generates the full invitation link for the current house.
 */
export async function getInviteLink(): Promise<string | null> {
  const house = await getCurrentHouse();
  if (!house) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/welcome?invite=${house.inviteCode}`;
}

export interface HouseMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

/**
 * Gets all members belonging to the current user's house.
 */
export async function getHouseMembers(): Promise<HouseMember[]> {
  const session = await auth();
  if (!session?.user?.email) return [];

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseId) return [];

  const members = await userRepository.findByHouseId(user.houseId);

  return members.map(({ id, name, email, avatarUrl }) => ({
    id,
    name,
    email,
    avatarUrl,
  }));
}
