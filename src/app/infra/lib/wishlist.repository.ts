import { Collection } from "mongodb";
import { Doc, getDb } from "@/app/infra/lib/mongodb";
import { WishlistItem } from "@/app/domain/entity/wishlist/wishlist-item.entity";
import logger from "./logger";

export class WishlistRepository {
  private collectionName = "wishlist_items";

  private async getCollection(): Promise<Collection<Doc<WishlistItem>>> {
    const db = await getDb();
    return db.collection<Doc<WishlistItem>>(this.collectionName);
  }

  async findAllByHouseId(houseId: string): Promise<WishlistItem[]> {
    try {
      const collection = await this.getCollection();
      return collection.find({ houseId }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      logger.error({ error, houseId }, "Error finding wishlist items");
      return [];
    }
  }

  async findById(id: string): Promise<WishlistItem | null> {
    try {
      const collection = await this.getCollection();
      return collection.findOne({ id });
    } catch (error) {
      logger.error({ error, id }, "Error finding wishlist item by id");
      return null;
    }
  }

  async create(item: WishlistItem): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.insertOne(item);
      logger.info(
        { itemId: item.id, houseId: item.houseId },
        "Wishlist item created",
      );
    } catch (error) {
      logger.error({ error, item }, "Error creating wishlist item");
      throw new Error("Falha ao criar item na lista de desejos.");
    }
  }

  async update(id: string, data: Partial<WishlistItem>): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.updateOne(
        { id },
        {
          $set: { ...data, updatedAt: new Date() },
        },
      );
      logger.info({ itemId: id }, "Wishlist item updated");
    } catch (error) {
      logger.error({ error, id, data }, "Error updating wishlist item");
      throw new Error("Falha ao atualizar item na lista de desejos.");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.deleteOne({ id });
      logger.info({ itemId: id }, "Wishlist item deleted");
    } catch (error) {
      logger.error({ error, id }, "Error deleting wishlist item");
      throw new Error("Falha ao excluir item da lista de desejos.");
    }
  }
}

export const wishlistRepository = new WishlistRepository();
