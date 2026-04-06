"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { userRepository } from "@/app/infra/lib/user.repository";
import { marketRepository } from "@/app/infra/lib/market.repository";
import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import {
  MarketCategory,
  MarketUnit,
  MarketPriority,
} from "@/app/domain/enums/market-category/market-category";
import logger from "@/app/infra/lib/logger";

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseId) return null;

  return user;
}

export async function getMarketItems(): Promise<MarketItem[]> {
  const user = await getUserContext();
  if (!user) return [];

  return marketRepository.findAllByHouseId(user.houseId);
}

export async function addMarketItem(formData: FormData) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const name = formData.get("name") as string;
  const category = formData.get("category") as MarketCategory;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unit = formData.get("unit") as MarketUnit;
  const priority = formData.get("priority") as MarketPriority;
  const lastPriceAmount = parseFloat(formData.get("lastPrice") as string || "0");
  const shouldMoveToInventory = formData.get("shouldMoveToInventory") === "true";
  const isShoppingListItem = formData.get("isShoppingListItem") === "true";

  try {
    const newItem: MarketItem = {
      id: crypto.randomUUID(),
      houseId: user.houseId,
      name,
      category,
      quantity,
      unit,
      priority,
      lastPrice: { amount: lastPriceAmount, currency: "BRL" },
      isBought: false,
      isInStock: !isShoppingListItem,
      shouldMoveToInventory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await marketRepository.create(newItem);
    revalidatePath("/(view)/(pages)/market", "page");
    revalidatePath("/market");
    return { success: true };
  } catch (error) {
    logger.error({ error, user: user.id }, "Error adding market item");
    return { success: false, error: "Erro ao adicionar item." };
  }
}

export async function toggleItemBought(id: string, isBought: boolean) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    const item = await marketRepository.findById(id);
    if (!item) throw new Error("Item não encontrado.");

    // Update isBought status and potentially move to stock based on preference
    await marketRepository.update(id, {
      isBought,
      isInStock: isBought && item.shouldMoveToInventory ? true : item.isInStock,
      updatedAt: new Date(),
    });

    revalidatePath("/(view)/(pages)/market", "page");
    revalidatePath("/market");
    return { success: true };
  } catch (error) {
    logger.error({ error, itemId: id }, "Error toggling item bought status");
    return { success: false, error: "Erro ao atualizar item." };
  }
}

export async function updateMarketItemQuantity(id: string, quantity: number) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    const item = await marketRepository.findById(id);
    if (!item) throw new Error("Item não encontrado.");

    const newQuantity = Math.max(0, quantity);
    
    await marketRepository.update(id, {
      quantity: newQuantity,
      updatedAt: new Date(),
    });

    revalidatePath("/(view)/(pages)/market", "page");
    revalidatePath("/market");
    return { success: true };
  } catch (error) {
    logger.error({ error, itemId: id }, "Error updating market item quantity");
    return { success: false, error: "Erro ao atualizar quantidade." };
  }
}

export async function deleteMarketItem(id: string) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await marketRepository.delete(id);
    revalidatePath("/(view)/(pages)/market", "page");
    revalidatePath("/market");
    return { success: true };
  } catch (error) {
    logger.error({ error, itemId: id }, "Error deleting market item");
    return { success: false, error: "Erro ao excluir item." };
  }
}

export async function updateMarketItem(id: string, data: Partial<MarketItem>) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await marketRepository.update(id, data);
    revalidatePath("/(view)/(pages)/market", "page");
    revalidatePath("/market");
    return { success: true };
  } catch (error) {
    logger.error({ error, itemId: id }, "Error updating market item");
    return { success: false, error: "Erro ao atualizar item." };
  }
}
