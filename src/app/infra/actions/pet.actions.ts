"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { userRepository } from "@/app/infra/lib/user.repository";
import { petRepository } from "@/app/infra/lib/pet.repository";
import { Pet, HealthRecord, PetService, PetNutrition } from "@/app/domain/entity/pet/pet.entities";
import { PetType, PetGender, HealthRecordType, ServiceType } from "@/app/domain/enums/pets/pet.enums";
import logger from "@/app/infra/lib/logger";

async function getUserContext() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await userRepository.findByEmail(session.user.email);
  if (!user || !user.houseId) return null;

  return user;
}

export async function getPets(): Promise<Pet[]> {
  const user = await getUserContext();
  if (!user) return [];

  return petRepository.findAllByHouseId(user.houseId);
}

export async function addPet(formData: FormData) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const name = formData.get("name") as string;
  const type = formData.get("type") as PetType;
  const breed = formData.get("breed") as string;
  const birthDate = new Date(formData.get("birthDate") as string);
  const weightValue = parseFloat(formData.get("weight") as string || "0");
  const weightUnit = formData.get("weightUnit") as "kg" | "g";
  const gender = formData.get("gender") as PetGender;

  try {
    const newPet: Pet = {
      id: crypto.randomUUID(),
      houseId: user.houseId,
      name,
      type,
      breed,
      birthDate,
      weight: { value: weightValue, unit: weightUnit },
      gender,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await petRepository.createPet(newPet);
    revalidatePath("/pets");
    return { success: true };
  } catch (error) {
    logger.error({ error, user: user.id }, "Error adding pet");
    return { success: false, error: "Erro ao adicionar pet." };
  }
}

export async function deletePet(id: string) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  try {
    await petRepository.deletePet(id);
    revalidatePath("/pets");
    return { success: true };
  } catch (error) {
    logger.error({ error, petId: id }, "Error deleting pet");
    return { success: false, error: "Erro ao excluir pet." };
  }
}

// Health Records Actions
export async function getHealthRecords(petId: string): Promise<HealthRecord[]> {
  return petRepository.findHealthRecordsByPetId(petId);
}

export async function addHealthRecord(formData: FormData) {
  const user = await getUserContext();
  if (!user) throw new Error("Usuário não autenticado.");

  const petId = formData.get("petId") as string;
  const type = formData.get("type") as HealthRecordType;
  const description = formData.get("description") as string;
  const date = new Date(formData.get("date") as string);
  const nextDueDateStr = formData.get("nextDueDate") as string;
  const vetName = formData.get("vetName") as string;

  try {
    const newRecord: HealthRecord = {
      id: crypto.randomUUID(),
      petId,
      type,
      description,
      date,
      nextDueDate: nextDueDateStr ? new Date(nextDueDateStr) : undefined,
      vetName: vetName || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await petRepository.createHealthRecord(newRecord);
    revalidatePath("/pets");
    return { success: true };
  } catch (error) {
    logger.error({ error, petId }, "Error adding health record");
    return { success: false, error: "Erro ao adicionar registro de saúde." };
  }
}

// Service Actions
export async function getPetServices(petId: string): Promise<PetService[]> {
  return petRepository.findServicesByPetId(petId);
}

// Nutrition Actions
export async function getPetNutrition(petId: string): Promise<PetNutrition | null> {
  return petRepository.findNutritionByPetId(petId);
}

export async function updatePetNutrition(petId: string, data: Omit<PetNutrition, "id" | "petId">) {
  try {
    const nutrition: PetNutrition = {
      id: crypto.randomUUID(),
      petId,
      ...data
    };
    await petRepository.upsertNutrition(nutrition);
    revalidatePath("/pets");
    return { success: true };
  } catch (error) {
    logger.error({ error, petId }, "Error updating pet nutrition");
    return { success: false, error: "Erro ao atualizar nutrição." };
  }
}
