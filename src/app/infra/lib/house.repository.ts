import { MongoClient, Collection } from "mongodb";
import clientPromise from "@/app/infra/lib/mongodb";
import { HouseEntity } from "@/app/domain/entity/house/house.entity";

export class HouseRepository {
  private collectionName = "houses";

  private async getCollection(): Promise<Collection<HouseEntity>> {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    return db.collection<HouseEntity>(this.collectionName);
  }

  async findById(id: string): Promise<HouseEntity | null> {
    const collection = await this.getCollection();
    return collection.findOne({ id });
  }

  async findByInviteCode(inviteCode: string): Promise<HouseEntity | null> {
    const collection = await this.getCollection();
    return collection.findOne({ inviteCode: inviteCode.toUpperCase() });
  }

  async create(house: HouseEntity): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(house);
  }

  async findByCreatorId(creatorId: string): Promise<HouseEntity | null> {
    const collection = await this.getCollection();
    return collection.findOne({ createdById: creatorId });
  }
}

export const houseRepository = new HouseRepository();
