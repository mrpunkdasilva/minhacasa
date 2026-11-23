import { Collection } from "mongodb";
import { Doc, getDb } from "@/app/infra/lib/mongodb";
import {
  Medication,
  MedicationAlarm,
  MedicationAlarmOccurrence,
  AlarmOccurrenceStatus,
  DoseLog,
  HealthAppointment,
} from "@/app/domain/entity/health/health.entities";
import logger from "./logger";

export class HealthRepository {
  private medicationsCollection = "medications";
  private alarmsCollection = "health_medication_alarms";
  private occurrencesCollection = "health_alarm_occurrences";
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
      await db
        .collection(this.occurrencesCollection)
        .deleteMany({ medicationId: id });
      await db
        .collection(this.alarmsCollection)
        .deleteMany({ medicationId: id });
      logger.info({ medId: id }, "Medication deleted");
    } catch (error) {
      logger.error({ error, id }, "Error deleting medication");
      throw new Error("Falha ao excluir medicamento.");
    }
  }

  // Medication alarms
  async findAllAlarmsByHouseId(houseId: string): Promise<MedicationAlarm[]> {
    try {
      const collection = await this.getCollection<MedicationAlarm>(
        this.alarmsCollection,
      );
      return collection.find({ houseId }).sort({ time: 1 }).toArray();
    } catch (error) {
      logger.error({ error, houseId }, "Error finding medication alarms");
      return [];
    }
  }

  async findAlarmById(id: string): Promise<MedicationAlarm | null> {
    try {
      const collection = await this.getCollection<MedicationAlarm>(
        this.alarmsCollection,
      );
      return collection.findOne({ id });
    } catch (error) {
      logger.error({ error, id }, "Error finding medication alarm by id");
      return null;
    }
  }

  async createAlarm(alarm: MedicationAlarm): Promise<void> {
    try {
      const collection = await this.getCollection<MedicationAlarm>(
        this.alarmsCollection,
      );
      await collection.insertOne(alarm);
      logger.info(
        { alarmId: alarm.id, houseId: alarm.houseId },
        "Medication alarm created",
      );
    } catch (error) {
      logger.error({ error, alarm }, "Error creating medication alarm");
      throw new Error("Falha ao criar alarme.");
    }
  }

  async updateAlarm(id: string, data: Partial<MedicationAlarm>): Promise<void> {
    try {
      const collection = await this.getCollection<MedicationAlarm>(
        this.alarmsCollection,
      );
      await collection.updateOne(
        { id },
        { $set: { ...data, updatedAt: new Date() } },
      );
    } catch (error) {
      logger.error({ error, id, data }, "Error updating medication alarm");
      throw new Error("Falha ao atualizar alarme.");
    }
  }

  async deleteAlarm(id: string): Promise<void> {
    try {
      const db = await getDb();
      await db.collection(this.alarmsCollection).deleteOne({ id });
      await db
        .collection(this.occurrencesCollection)
        .updateMany({ alarmId: id }, { $unset: { alarmId: "" } });
    } catch (error) {
      logger.error({ error, id }, "Error deleting medication alarm");
      throw new Error("Falha ao excluir alarme.");
    }
  }

  // Persisted alarm occurrences (one per dose)
  async findAlarmOccurrencesByHouseAndDate(
    houseId: string,
    date: string,
  ): Promise<MedicationAlarmOccurrence[]> {
    try {
      const collection = await this.getCollection<MedicationAlarmOccurrence>(
        this.occurrencesCollection,
      );
      return collection.find({ houseId, date }).sort({ time: 1 }).toArray();
    } catch (error) {
      logger.error({ error, houseId, date }, "Error finding alarm occurrences");
      return [];
    }
  }

  async findAlarmOccurrenceById(
    id: string,
  ): Promise<MedicationAlarmOccurrence | null> {
    try {
      const collection = await this.getCollection<MedicationAlarmOccurrence>(
        this.occurrencesCollection,
      );
      return collection.findOne({ id });
    } catch (error) {
      logger.error({ error, id }, "Error finding alarm occurrence by id");
      return null;
    }
  }

  async findAlarmOccurrenceByKey(
    medicationId: string,
    date: string,
    time: string,
  ): Promise<MedicationAlarmOccurrence | null> {
    try {
      const collection = await this.getCollection<MedicationAlarmOccurrence>(
        this.occurrencesCollection,
      );
      return collection.findOne({ medicationId, date, time });
    } catch (error) {
      logger.error(
        { error, medicationId, date, time },
        "Error finding alarm occurrence",
      );
      return null;
    }
  }

  async upsertAlarmOccurrence(
    occurrence: MedicationAlarmOccurrence,
  ): Promise<void> {
    try {
      const collection = await this.getCollection<MedicationAlarmOccurrence>(
        this.occurrencesCollection,
      );
      await collection.updateOne(
        {
          houseId: occurrence.houseId,
          medicationId: occurrence.medicationId,
          date: occurrence.date,
          time: occurrence.time,
        },
        { $setOnInsert: occurrence },
        { upsert: true },
      );
    } catch (error) {
      logger.error({ error, occurrence }, "Error creating alarm occurrence");
      throw new Error("Falha ao criar alarme.");
    }
  }

  async updateAlarmOccurrenceStatus(
    medicationId: string,
    date: string,
    time: string,
    status: AlarmOccurrenceStatus,
  ): Promise<void> {
    try {
      const collection = await this.getCollection<MedicationAlarmOccurrence>(
        this.occurrencesCollection,
      );
      await collection.updateOne(
        { medicationId, date, time },
        { $set: { status, updatedAt: new Date() } },
      );
    } catch (error) {
      logger.error(
        { error, medicationId, date, time },
        "Error updating alarm occurrence",
      );
      throw new Error("Falha ao atualizar alarme.");
    }
  }

  async deleteAlarmOccurrence(id: string): Promise<void> {
    try {
      const collection = await this.getCollection<MedicationAlarmOccurrence>(
        this.occurrencesCollection,
      );
      await collection.updateOne(
        { id },
        { $set: { status: "dismissed", updatedAt: new Date() } },
      );
    } catch (error) {
      logger.error({ error, id }, "Error deleting alarm occurrence");
      throw new Error("Falha ao excluir alarme.");
    }
  }

  async deleteStaleAlarmOccurrences(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      const collection = await this.getCollection<MedicationAlarmOccurrence>(
        this.occurrencesCollection,
      );
      await collection.deleteMany({ id: { $in: ids } });
    } catch (error) {
      logger.error({ error, ids }, "Error deleting stale alarm occurrences");
      throw new Error("Falha ao limpar alarmes antigos.");
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
