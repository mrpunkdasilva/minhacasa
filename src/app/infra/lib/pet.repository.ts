import { MongoClient, Collection } from "mongodb";
import clientPromise from "@/app/infra/lib/mongodb";
import { Pet, HealthRecord, PetService, PetNutrition } from "@/app/domain/entity/pet/pet.entities";
import logger from "./logger";

export class PetRepository {
  private petsCollection = "pets";
  private healthCollection = "pet_health_records";
  private servicesCollection = "pet_services";
  private nutritionCollection = "pet_nutrition";

  private async getCollection<T>(name: string): Promise<Collection<T>> {
    const client: MongoClient = await clientPromise;
    const db = client.db();
    return db.collection<T>(name);
  }

  // Pet CRUD
  async findAllByHouseId(houseId: string): Promise<Pet[]> {
    try {
      const collection = await this.getCollection<Pet>(this.petsCollection);
      return collection.find({ houseId } as any).sort({ name: 1 }).toArray();
    } catch (error) {
      logger.error({ error, houseId }, "Error finding pets");
      return [];
    }
  }

  async findPetById(id: string): Promise<Pet | null> {
    try {
      const collection = await this.getCollection<Pet>(this.petsCollection);
      return collection.findOne({ id } as any);
    } catch (error) {
      logger.error({ error, id }, "Error finding pet by id");
      return null;
    }
  }

  async createPet(pet: Pet): Promise<void> {
    try {
      const collection = await this.getCollection<Pet>(this.petsCollection);
      await collection.insertOne(pet as any);
    } catch (error) {
      logger.error({ error, pet }, "Error creating pet");
      throw new Error("Falha ao criar pet.");
    }
  }

  async updatePet(id: string, data: Partial<Pet>): Promise<void> {
    try {
      const collection = await this.getCollection<Pet>(this.petsCollection);
      await collection.updateOne({ id } as any, { $set: { ...data, updatedAt: new Date() } });
    } catch (error) {
      logger.error({ error, id, data }, "Error updating pet");
      throw new Error("Falha ao atualizar pet.");
    }
  }

  async deletePet(id: string): Promise<void> {
    try {
      const client: MongoClient = await clientPromise;
      const db = client.db();
      
      // Delete pet and all related data
      await db.collection(this.petsCollection).deleteOne({ id });
      await db.collection(this.healthCollection).deleteMany({ petId: id });
      await db.collection(this.servicesCollection).deleteMany({ petId: id });
      await db.collection(this.nutritionCollection).deleteMany({ petId: id });
    } catch (error) {
      logger.error({ error, id }, "Error deleting pet");
      throw new Error("Falha ao excluir pet.");
    }
  }

  // Health Records
  async findHealthRecordsByPetId(petId: string): Promise<HealthRecord[]> {
    try {
      const collection = await this.getCollection<HealthRecord>(this.healthCollection);
      return collection.find({ petId } as any).sort({ date: -1 }).toArray();
    } catch (error) {
      logger.error({ error, petId }, "Error finding health records");
      return [];
    }
  }

  async createHealthRecord(record: HealthRecord): Promise<void> {
    try {
      const collection = await this.getCollection<HealthRecord>(this.healthCollection);
      await collection.insertOne(record as any);
    } catch (error) {
      logger.error({ error, record }, "Error creating health record");
      throw new Error("Falha ao criar registro de saúde.");
    }
  }

  // Services
  async findServicesByPetId(petId: string): Promise<PetService[]> {
    try {
      const collection = await this.getCollection<PetService>(this.servicesCollection);
      return collection.find({ petId } as any).sort({ date: -1 }).toArray();
    } catch (error) {
      logger.error({ error, petId }, "Error finding pet services");
      return [];
    }
  }

  async createService(service: PetService): Promise<void> {
    try {
      const collection = await this.getCollection<PetService>(this.servicesCollection);
      await collection.insertOne(service as any);
    } catch (error) {
      logger.error({ error, service }, "Error creating pet service");
      throw new Error("Falha ao criar registro de serviço.");
    }
  }

  // Nutrition
  async findNutritionByPetId(petId: string): Promise<PetNutrition | null> {
    try {
      const collection = await this.getCollection<PetNutrition>(this.nutritionCollection);
      return collection.findOne({ petId } as any);
    } catch (error) {
      logger.error({ error, petId }, "Error finding pet nutrition");
      return null;
    }
  }

  async upsertNutrition(nutrition: PetNutrition): Promise<void> {
    try {
      const collection = await this.getCollection<PetNutrition>(this.nutritionCollection);
      await collection.updateOne(
        { petId: nutrition.petId } as any,
        { $set: nutrition },
        { upsert: true }
      );
    } catch (error) {
      logger.error({ error, nutrition }, "Error upserting pet nutrition");
      throw new Error("Falha ao salvar nutrição.");
    }
  }
}

export const petRepository = new PetRepository();
