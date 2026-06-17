import { MongoClient, Collection } from "mongodb";
import clientPromise from "@/app/infra/lib/mongodb";
import { WishlistItem } from "@/app/domain/entity/wishlist/wishlist-item.entity";
import logger from "./logger";

export class WishlistRepository {
  private collectionName = "wishlist_items";

  private async getCollection(): Promise<Collection<WishlistItem>> {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    return db.collection<WishlistItem>(this.collectionName);
  }

  async findAllByHouseId(houseId: string): Promise<WishlistItem[]> {
    try {
      const collection = await this.getCollection();
      return collection.find({ houseId } as any).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      logger.error({ error, houseId }, "Error finding wishlist items");
      return [];
    }
  }

  async findById(id: string): Promise<WishlistItem | null> {
    try {
      const collection = await this.getCollection();
      return collection.findOne({ id } as any);
    } catch (error) {
      logger.error({ error, id }, "Error finding wishlist item by id");
      return null;
    }
  }

  async create(item: WishlistItem): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.insertOne(item as any);
      logger.info({ itemId: item.id, houseId: item.houseId }, "Wishlist item created");
    } catch (error) {
      logger.error({ error, item }, "Error creating wishlist item");
      throw new Error("Falha ao criar item na lista de desejos.");
    }
  }

  async update(id: string, data: Partial<WishlistItem>): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.updateOne({ id } as any, { $set: { ...data, updatedAt: new Date() } });
      logger.info({ itemId: id }, "Wishlist item updated");
    } catch (error) {
      logger.error({ error, id, data }, "Error updating wishlist item");
      throw new Error("Falha ao atualizar item na lista de desejos.");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.deleteOne({ id } as any);
      logger.info({ itemId: id }, "Wishlist item deleted");
    } catch (error) {
      logger.error({ error, id }, "Error deleting wishlist item");
      throw new Error("Falha ao excluir item da lista de desejos.");
    }
  }
}

export const wishlistRepository = new WishlistRepository();
