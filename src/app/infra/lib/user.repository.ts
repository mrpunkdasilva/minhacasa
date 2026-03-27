import { MongoClient, Collection } from "mongodb";
import clientPromise from "@/app/infra/lib/mongodb";
import { UserEntity } from "@/app/domain/entity/user/user.entity";

export class UserRepository {
  private collectionName = "users";

  private async getCollection(): Promise<Collection<UserEntity>> {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    return db.collection<UserEntity>(this.collectionName);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const collection = await this.getCollection();
    return collection.findOne({ email });
  }

  async findByUuid(uuid: string): Promise<UserEntity | null> {
    const collection = await this.getCollection();
    return collection.findOne({ uuid });
  }

  async create(user: UserEntity): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(user);
  }
}

export const userRepository = new UserRepository();
