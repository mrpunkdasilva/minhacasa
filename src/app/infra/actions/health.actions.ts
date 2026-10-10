"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { userRepository } from "@/app/infra/lib/user.repository";
import { healthRepository } from "@/app/infra/lib/health.repository";
import {
  Medication,
  DoseLog,
  HealthAppointment,
} from "@/app/domain/entity/health/health.entities";
import {
  MedicationSubject,
  MedicationType,
  DosageUnit,
  AppointmentType,
} from "@/app/domain/enums/health/health.enums";
import logger from "@/app/infra/lib/logger";
import { getDoseTimesForDate } from "@/app/infra/lib/health-schedule";

const HEALTH_ROUTES = [
  "/health/alerts",
  "/health/medications",
  "/health/appointments",
] as const;

function revalidateHealth() {
  for (const route of HEALTH_ROUTES) {
    revalidatePath(route);
  }
}

/** Medication already resolved with the dose times computed for today. */
export type MedicationWithToday = Medication & { todayTimes: string[] };

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseId) return null;

  return user;
}

function parseTime(raw: FormDataEntryValue | null): string | null {
  const value = (raw as string)?.trim();
  if (!value || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) return null;
  return value;
}

function parseOptionalDate(raw: FormDataEntryValue | null): Date | undefined {
  const value = (raw as string)?.trim();
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function getMedications(): Promise<MedicationWithToday[]> {
  const user = await getUserContext();
  if (!user) return [];

  const medications = await healthRepository.findAllMedicationsByHouseId(
    user.houseId,
  );
  const today = new Date();

  return medications.map((med) => ({
    ...med,
    todayTimes: getDoseTimesForDate(med, today),
  }));
}

export async function getDoseLogs(medIds: string[]): Promise<DoseLog[]> {
  const user = await getUserContext();
  if (!user) return [];

  return healthRepository.findDoseLogsByMedIds(medIds);
}

export async function getAppointments(): Promise<HealthAppointment[]> {
  const user = await getUserContext();
  if (!user) return [];

  return healthRepository.findAllAppointmentsByHouseId(user.houseId);
}

export async function addMedication(formData: FormData) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { success: false, error: "Informe o nome." };

  const startTime = parseTime(formData.get("startTime"));
  if (!startTime) {
    return { success: false, error: "Informe a hora inicial da dose." };
  }

  const intervalHours = parseFloat(
    (formData.get("intervalHours") as string) ?? "0",
  );
  if (!Number.isFinite(intervalHours) || intervalHours <= 0) {
    return { success: false, error: "Informe o intervalo entre doses." };
  }

  const subject = formData.get("subject") as MedicationSubject;
  const subjectName = (formData.get("subjectName") as string)?.trim();

  try {
    const medication: Medication = {
      id: crypto.randomUUID(),
      houseId: user.houseId,
      name,
      subject,
      subjectName: subjectName || undefined,
      petId: (formData.get("petId") as string) || undefined,
      type: formData.get("type") as MedicationType,
      dosage: parseFloat((formData.get("dosage") as string) || "0"),
      dosageUnit: formData.get("dosageUnit") as DosageUnit,
      startTime,
      intervalHours,
      startDate: parseOptionalDate(formData.get("startDate")) ?? new Date(),
      endDate: parseOptionalDate(formData.get("endDate")),
      stock: parseStock(formData),
      expirationDate: parseOptionalDate(formData.get("expirationDate")),
      instructions:
        (formData.get("instructions") as string)?.trim() || undefined,
      active: formData.get("active") !== "false",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await healthRepository.createMedication(medication);
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, user: user.id }, "Error adding medication");
    return { success: false, error: "Erro ao adicionar medicamento." };
  }
}

export async function updateMedication(id: string, formData: FormData) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { success: false, error: "Informe o nome." };

  const startTime = parseTime(formData.get("startTime"));
  if (!startTime) {
    return { success: false, error: "Informe a hora inicial da dose." };
  }

  const intervalHours = parseFloat(
    (formData.get("intervalHours") as string) ?? "0",
  );
  if (!Number.isFinite(intervalHours) || intervalHours <= 0) {
    return { success: false, error: "Informe o intervalo entre doses." };
  }

  try {
    const data: Partial<Medication> = {
      name,
      subject: formData.get("subject") as MedicationSubject,
      subjectName: (formData.get("subjectName") as string)?.trim() || undefined,
      petId: (formData.get("petId") as string) || undefined,
      type: formData.get("type") as MedicationType,
      dosage: parseFloat((formData.get("dosage") as string) || "0"),
      dosageUnit: formData.get("dosageUnit") as DosageUnit,
      startTime,
      intervalHours,
      startDate: parseOptionalDate(formData.get("startDate")) ?? new Date(),
      endDate: parseOptionalDate(formData.get("endDate")),
      stock: parseStock(formData),
      expirationDate: parseOptionalDate(formData.get("expirationDate")),
      instructions:
        (formData.get("instructions") as string)?.trim() || undefined,
      active: formData.get("active") !== "false",
    };

    await healthRepository.updateMedication(id, data);
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, medId: id }, "Error updating medication");
    return { success: false, error: "Erro ao atualizar medicamento." };
  }
}

export async function deleteMedication(id: string) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await healthRepository.deleteMedication(id);
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, medId: id }, "Error deleting medication");
    return { success: false, error: "Erro ao excluir medicamento." };
  }
}

export async function toggleMedicationActive(id: string, active: boolean) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await healthRepository.updateMedication(id, { active });
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, medId: id }, "Error toggling medication");
    return { success: false, error: "Erro ao atualizar medicamento." };
  }
}

export async function setDoseTaken(
  medId: string,
  date: string,
  time: string,
  taken: boolean,
) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    if (taken) {
      const log: DoseLog = {
        id: crypto.randomUUID(),
        medId,
        date,
        time,
        takenAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await healthRepository.upsertDoseLog(log);
    } else {
      await healthRepository.deleteDoseLog(medId, date, time);
    }
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, medId, date, time }, "Error setting dose taken");
    return { success: false, error: "Erro ao registrar dose." };
  }
}

export async function addAppointment(formData: FormData) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { success: false, error: "Informe o título." };

  const date = parseOptionalDate(formData.get("date"));
  if (!date) return { success: false, error: "Informe uma data válida." };

  try {
    const appointment: HealthAppointment = {
      id: crypto.randomUUID(),
      houseId: user.houseId,
      title,
      type: formData.get("type") as AppointmentType,
      date,
      location: (formData.get("location") as string)?.trim() || undefined,
      doctorName: (formData.get("doctorName") as string)?.trim() || undefined,
      notes: (formData.get("notes") as string)?.trim() || undefined,
      reminderDaysBefore:
        parseInt((formData.get("reminderDaysBefore") as string) ?? "1", 10) ||
        1,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await healthRepository.createAppointment(appointment);
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, user: user.id }, "Error adding appointment");
    return { success: false, error: "Erro ao adicionar compromisso." };
  }
}

export async function updateAppointment(id: string, formData: FormData) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { success: false, error: "Informe o título." };

  const date = parseOptionalDate(formData.get("date"));
  if (!date) return { success: false, error: "Informe uma data válida." };

  try {
    const data: Partial<HealthAppointment> = {
      title,
      type: formData.get("type") as AppointmentType,
      date,
      location: (formData.get("location") as string)?.trim() || undefined,
      doctorName: (formData.get("doctorName") as string)?.trim() || undefined,
      notes: (formData.get("notes") as string)?.trim() || undefined,
      reminderDaysBefore:
        parseInt((formData.get("reminderDaysBefore") as string) ?? "1", 10) ||
        1,
    };

    await healthRepository.updateAppointment(id, data);
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, appointmentId: id }, "Error updating appointment");
    return { success: false, error: "Erro ao atualizar compromisso." };
  }
}

export async function toggleAppointmentCompleted(
  id: string,
  completed: boolean,
) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await healthRepository.updateAppointment(id, { completed });
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, appointmentId: id }, "Error completing appointment");
    return { success: false, error: "Erro ao atualizar compromisso." };
  }
}

export async function deleteAppointment(id: string) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await healthRepository.deleteAppointment(id);
    revalidateHealth();
    return { success: true };
  } catch (error) {
    logger.error({ error, appointmentId: id }, "Error deleting appointment");
    return { success: false, error: "Erro ao excluir compromisso." };
  }
}

function parseStock(formData: FormData): Medication["stock"] {
  const currentRaw = (formData.get("stockCurrent") as string)?.trim();
  const minRaw = (formData.get("stockMin") as string)?.trim();
  if (!currentRaw && !minRaw) return undefined;

  return {
    current: parseFloat(currentRaw || "0"),
    min: parseFloat(minRaw || "0"),
  };
}
