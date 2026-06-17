"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { userRepository } from "@/app/infra/lib/user.repository";
import { wishlistRepository } from "@/app/infra/lib/wishlist.repository";
import { WishlistItem } from "@/app/domain/entity/wishlist/wishlist-item.entity";
import { WishlistPriority } from "@/app/domain/enums/wishlist/wishlist-priority";
import { WishlistCategory } from "@/app/domain/enums/wishlist/wishlist-category";
import logger from "@/app/infra/lib/logger";

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseId) return null;

  return user;
}

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const user = await getUserContext();
  if (!user) return [];

  return wishlistRepository.findAllByHouseId(user.houseId);
}

export async function addWishlistItem(formData: FormData) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const name = formData.get("name") as string;
  const priceAmount = parseFloat(formData.get("price") as string || "0");
  const priority = formData.get("priority") as WishlistPriority;
  const category = formData.get("category") as WishlistCategory;
  const url = formData.get("url") as string;
  const savedAmount = parseFloat(formData.get("savedAmount") as string || "0");

  try {
    const newItem: WishlistItem = {
      id: crypto.randomUUID(),
      houseId: user.houseId,
      name,
      price: { amount: priceAmount, currency: "BRL" },
      priority,
      category,
      url: url || undefined,
      savedAmount: { amount: savedAmount, currency: "BRL" },
      isPurchased: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await wishlistRepository.create(newItem);
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    logger.error({ error, user: user.id }, "Error adding wishlist item");
    return { success: false, error: "Erro ao adicionar item à wishlist." };
  }
}

export async function toggleWishlistItemPurchased(id: string, isPurchased: boolean) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await wishlistRepository.update(id, {
      isPurchased,
      updatedAt: new Date(),
    });

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    logger.error({ error, itemId: id }, "Error toggling wishlist item purchased status");
    return { success: false, error: "Erro ao atualizar status do item." };
  }
}

export async function updateWishlistSavedAmount(id: string, amount: number) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await wishlistRepository.update(id, {
      savedAmount: { amount, currency: "BRL" },
      updatedAt: new Date(),
    });

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    logger.error({ error, itemId: id }, "Error updating wishlist saved amount");
    return { success: false, error: "Erro ao atualizar valor economizado." };
  }
}

export async function deleteWishlistItem(id: string) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await wishlistRepository.delete(id);
    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    logger.error({ error, itemId: id }, "Error deleting wishlist item");
    return { success: false, error: "Erro ao excluir item da wishlist." };
  }
}
