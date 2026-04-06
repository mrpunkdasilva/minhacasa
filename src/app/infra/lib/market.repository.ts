import { MongoClient, Collection } from "mongodb";
import clientPromise from "@/app/infra/lib/mongodb";
import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import logger from "./logger";

export class MarketRepository {
  private collectionName = "market_items";

  private async getCollection(): Promise<Collection<MarketItem>> {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    return db.collection<MarketItem>(this.collectionName);
  }

  async findAllByHouseId(houseId: string): Promise<MarketItem[]> {
    try {
      const collection = await this.getCollection();
      return collection.find({ houseId }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      logger.error({ error, houseId }, "Error finding market items");
      return [];
    }
  }

  async findById(id: string): Promise<MarketItem | null> {
    try {
      const collection = await this.getCollection();
      return collection.findOne({ id });
    } catch (error) {
      logger.error({ error, id }, "Error finding market item by id");
      return null;
    }
  }

  async create(item: MarketItem): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.insertOne(item);
      logger.info({ itemId: item.id, houseId: item.houseId }, "Market item created");
    } catch (error) {
      logger.error({ error, item }, "Error creating market item");
      throw new Error("Falha ao criar item de mercado.");
    }
  }

  async update(id: string, data: Partial<MarketItem>): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.updateOne({ id }, { $set: { ...data, updatedAt: new Date() } });
      logger.info({ itemId: id }, "Market item updated");
    } catch (error) {
      logger.error({ error, id, data }, "Error updating market item");
      throw new Error("Falha ao atualizar item de mercado.");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.deleteOne({ id });
      logger.info({ itemId: id }, "Market item deleted");
    } catch (error) {
      logger.error({ error, id }, "Error deleting market item");
      throw new Error("Falha ao excluir item de mercado.");
    }
  }
}

export const marketRepository = new MarketRepository();
