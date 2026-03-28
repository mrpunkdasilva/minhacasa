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
    houseUuid?: string;
  };
}

/**
 * Gets the current user's house information.
 */
export async function getCurrentHouse(): Promise<HouseEntity | null> {
  const session = (await auth()) as ExtendedSession;

  if (!session?.user) {
    return null;
  }

  // 1. Try houseUuid directly from session
  const sessionHouseUuid = session.user.houseUuid;
  if (sessionHouseUuid) {
    const house = await houseRepository.findByUuid(sessionHouseUuid);
    if (house) {
      const { _id, ...cleanHouse } = house as HouseEntity & { _id?: unknown };
      return cleanHouse;
    }
  }

  // 2. Fallback to existing database lookup
  const email = session.user.email;
  const userId = session.user.id;

  let user = null;
  if (email) user = await userRepository.findByEmail(email);
  if (!user && userId) user = await userRepository.findByUuid(userId);

  // If user not found in DB even with session, we can't do much (shouldn't happen)
  if (!user) {
    return null;
  }

  // 3. AUTO-REPAIR: If user has no house, create one!
  if (!user.houseUuid) {
    const houseUuid = crypto.randomUUID();
    const newHouse: HouseEntity = {
      uuid: houseUuid,
      name: `Casa de ${user.name.split(" ")[0]}`,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdByUuid: user.uuid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await houseRepository.create(newHouse);
    await userRepository.update(user.uuid, { houseUuid });

    const { _id, ...cleanHouse } = newHouse as HouseEntity & { _id?: unknown };
    return cleanHouse;
  }

  // 4. Try finding the house from user's houseUuid
  const house = await houseRepository.findByUuid(user.houseUuid);

  // 5. AUTO-REPAIR: If house record is missing but UUID exists, create it!
  if (!house) {
    const newHouse: HouseEntity = {
      uuid: user.houseUuid,
      name: `Casa de ${user.name.split(" ")[0]}`,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdByUuid: user.uuid,
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
  uuid: string;
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
  if (!user || !user.houseUuid) return [];

  const members = await userRepository.findByHouseUuid(user.houseUuid);

  return members.map(({ uuid, name, email, avatarUrl }) => ({
    uuid,
    name,
    email,
    avatarUrl,
  }));
}
