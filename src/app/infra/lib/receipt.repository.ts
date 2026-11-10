import { Collection } from "mongodb";
import { getDb } from "@/app/infra/lib/mongodb";
import { ReceiptEntity } from "@/app/domain/entity/receipt/receipt.entity";
import logger from "./logger";

interface ReceiptImportAttempt {
  houseId: string;
  createdAt: Date;
}

export class ReceiptRepository {
  private collectionName = "receipts";
  private attemptsCollectionName = "receipt_import_attempts";
  private indexesPromise: Promise<unknown> | null = null;
  private attemptsIndexesPromise: Promise<unknown> | null = null;

  private async getCollection(): Promise<Collection<ReceiptEntity>> {
    const db = await getDb();
    const collection = db.collection<ReceiptEntity>(this.collectionName);

    if (!this.indexesPromise) {
      this.indexesPromise = Promise.all([
        collection.createIndex(
          { houseId: 1, accessKey: 1 },
          { unique: true, name: "house_access_key" },
        ),
        collection.createIndex(
          { houseId: 1, issuedAt: -1 },
          { name: "house_issued_at" },
        ),
      ]).catch((error) => {
        this.indexesPromise = null;
        logger.warn({ error }, "Could not ensure receipt indexes");
      });
    }

    await this.indexesPromise;
    return collection;
  }

  async findAllByHouseId(houseId: string): Promise<ReceiptEntity[]> {
    try {
      const collection = await this.getCollection();
      return collection
        .find({ houseId })
        .sort({ issuedAt: -1, createdAt: -1 })
        .toArray();
    } catch (error) {
      logger.error({ error, houseId }, "Error finding receipts");
      return [];
    }
  }

  async findById(id: string, houseId: string): Promise<ReceiptEntity | null> {
    try {
      const collection = await this.getCollection();
      return collection.findOne({ id, houseId });
    } catch (error) {
      logger.error({ error, id, houseId }, "Error finding receipt by id");
      return null;
    }
  }

  async findByAccessKey(
    houseId: string,
    accessKey: string,
  ): Promise<ReceiptEntity | null> {
    try {
      const collection = await this.getCollection();
      return collection.findOne({ houseId, accessKey });
    } catch (error) {
      logger.error(
        { error, houseId, accessKey },
        "Error finding receipt by access key",
      );
      return null;
    }
  }

  async create(receipt: ReceiptEntity): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.insertOne(receipt);
      logger.info(
        { receiptId: receipt.id, houseId: receipt.houseId },
        "Receipt created",
      );
    } catch (error) {
      logger.error({ error, receipt }, "Error creating receipt");
      throw new Error("Falha ao salvar a nota fiscal.");
    }
  }

  async delete(id: string, houseId: string): Promise<void> {
    try {
      const collection = await this.getCollection();
      await collection.deleteOne({ id, houseId });
      logger.info({ receiptId: id, houseId }, "Receipt deleted");
    } catch (error) {
      logger.error({ error, id, houseId }, "Error deleting receipt");
      throw new Error("Falha ao excluir a nota fiscal.");
    }
  }

  async countByHouseIdSince(houseId: string, since: Date): Promise<number> {
    try {
      const collection = await this.getCollection();
      return collection.countDocuments({ houseId, createdAt: { $gte: since } });
    } catch (error) {
      logger.error({ error, houseId, since }, "Error counting recent receipts");
      return 0;
    }
  }

  private async getAttemptsCollection(): Promise<
    Collection<ReceiptImportAttempt>
  > {
    const db = await getDb();
    const collection = db.collection<ReceiptImportAttempt>(
      this.attemptsCollectionName,
    );

    if (!this.attemptsIndexesPromise) {
      this.attemptsIndexesPromise = Promise.all([
        collection.createIndex(
          { createdAt: 1 },
          { expireAfterSeconds: 3600, name: "attempt_ttl" },
        ),
        collection.createIndex(
          { houseId: 1, createdAt: -1 },
          { name: "house_attempt_created_at" },
        ),
      ]).catch((error) => {
        this.attemptsIndexesPromise = null;
        logger.warn({ error }, "Could not ensure receipt attempt indexes");
      });
    }

    await this.attemptsIndexesPromise;
    return collection;
  }

  async countAttemptsSince(houseId: string, since: Date): Promise<number> {
    try {
      const collection = await this.getAttemptsCollection();
      return collection.countDocuments({ houseId, createdAt: { $gte: since } });
    } catch (error) {
      logger.error(
        { error, houseId, since },
        "Error counting receipt import attempts",
      );
      return 0;
    }
  }

  async recordAttempt(houseId: string): Promise<void> {
    try {
      const collection = await this.getAttemptsCollection();
      await collection.insertOne({ houseId, createdAt: new Date() });
    } catch (error) {
      logger.error({ error, houseId }, "Error recording receipt attempt");
    }
  }
}

export const receiptRepository = new ReceiptRepository();
