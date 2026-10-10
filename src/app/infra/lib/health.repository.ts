import { Collection } from "mongodb";
import { Doc, getDb } from "@/app/infra/lib/mongodb";
import {
  Medication,
  DoseLog,
  HealthAppointment,
} from "@/app/domain/entity/health/health.entities";
import logger from "./logger";

export class HealthRepository {
  private medicationsCollection = "medications";
  private dosesCollection = "health_dose_logs";
  private appointmentsCollection = "health_appointments";

  private async getCollection<T>(name: string): Promise<Collection<Doc<T>>> {
    const db = await getDb();
    return db.collection<Doc<T>>(name);
  }

  // Medications
  async findAllMedicationsByHouseId(houseId: string): Promise<Medication[]> {
    try {
      const collection = await this.getCollection<Medication>(
        this.medicationsCollection,
      );
      return collection.find({ houseId }).sort({ name: 1 }).toArray();
    } catch (error) {
      logger.error({ error, houseId }, "Error finding medications");
      return [];
    }
  }

  async findMedicationById(id: string): Promise<Medication | null> {
    try {
      const collection = await this.getCollection<Medication>(
        this.medicationsCollection,
      );
      return collection.findOne({ id });
    } catch (error) {
      logger.error({ error, id }, "Error finding medication by id");
      return null;
    }
  }

  async createMedication(medication: Medication): Promise<void> {
    try {
      const collection = await this.getCollection<Medication>(
        this.medicationsCollection,
      );
      await collection.insertOne(medication);
      logger.info(
        { medId: medication.id, houseId: medication.houseId },
        "Medication created",
      );
    } catch (error) {
      logger.error({ error, medication }, "Error creating medication");
      throw new Error("Falha ao criar medicamento.");
    }
  }

  async updateMedication(id: string, data: Partial<Medication>): Promise<void> {
    try {
      const collection = await this.getCollection<Medication>(
        this.medicationsCollection,
      );
      await collection.updateOne(
        { id },
        { $set: { ...data, updatedAt: new Date() } },
      );
      logger.info({ medId: id }, "Medication updated");
    } catch (error) {
      logger.error({ error, id, data }, "Error updating medication");
      throw new Error("Falha ao atualizar medicamento.");
    }
  }

  async deleteMedication(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.collection(this.medicationsCollection).deleteOne({ id });
      await db.collection(this.dosesCollection).deleteMany({ medId: id });
      logger.info({ medId: id }, "Medication deleted");
    } catch (error) {
      logger.error({ error, id }, "Error deleting medication");
      throw new Error("Falha ao excluir medicamento.");
    }
  }

  // Dose logs
  async findDoseLogsByMedIds(medIds: string[]): Promise<DoseLog[]> {
    if (medIds.length === 0) return [];

    try {
      const collection = await this.getCollection<DoseLog>(
        this.dosesCollection,
      );
      return collection.find({ medId: { $in: medIds } }).toArray();
    } catch (error) {
      logger.error({ error, medIds }, "Error finding dose logs");
      return [];
    }
  }

  async upsertDoseLog(log: DoseLog): Promise<void> {
    try {
      const collection = await this.getCollection<DoseLog>(
        this.dosesCollection,
      );
      await collection.updateOne(
        { medId: log.medId, date: log.date, time: log.time },
        { $set: log },
        { upsert: true },
      );
    } catch (error) {
      logger.error({ error, log }, "Error upserting dose log");
      throw new Error("Falha ao registrar dose.");
    }
  }

  async deleteDoseLog(
    medId: string,
    date: string,
    time: string,
  ): Promise<void> {
    try {
      const collection = await this.getCollection<DoseLog>(
        this.dosesCollection,
      );
      await collection.deleteOne({ medId, date, time });
    } catch (error) {
      logger.error({ error, medId, date, time }, "Error deleting dose log");
      throw new Error("Falha ao desfazer registro de dose.");
    }
  }

  // Appointments
  async findAllAppointmentsByHouseId(
    houseId: string,
  ): Promise<HealthAppointment[]> {
    try {
      const collection = await this.getCollection<HealthAppointment>(
        this.appointmentsCollection,
      );
      return collection.find({ houseId }).sort({ date: 1 }).toArray();
    } catch (error) {
      logger.error({ error, houseId }, "Error finding appointments");
      return [];
    }
  }

  async createAppointment(appointment: HealthAppointment): Promise<void> {
    try {
      const collection = await this.getCollection<HealthAppointment>(
        this.appointmentsCollection,
      );
      await collection.insertOne(appointment);
    } catch (error) {
      logger.error({ error, appointment }, "Error creating appointment");
      throw new Error("Falha ao criar compromisso de saúde.");
    }
  }

  async updateAppointment(
    id: string,
    data: Partial<HealthAppointment>,
  ): Promise<void> {
    try {
      const collection = await this.getCollection<HealthAppointment>(
        this.appointmentsCollection,
      );
      await collection.updateOne(
        { id },
        { $set: { ...data, updatedAt: new Date() } },
      );
    } catch (error) {
      logger.error({ error, id, data }, "Error updating appointment");
      throw new Error("Falha ao atualizar compromisso de saúde.");
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      const collection = await this.getCollection<HealthAppointment>(
        this.appointmentsCollection,
      );
      await collection.deleteOne({ id });
    } catch (error) {
      logger.error({ error, id }, "Error deleting appointment");
      throw new Error("Falha ao excluir compromisso de saúde.");
    }
  }
}

export const healthRepository = new HealthRepository();
