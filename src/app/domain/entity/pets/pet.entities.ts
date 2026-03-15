import { PetType, HealthRecordType, ServiceType } from "../../enums/pets/pet.enums";

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  birthDate: Date;
  weight: number;
  gender: "Macho" | "Fêmea";
  avatar?: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: HealthRecordType;
  description: string;
  date: Date;
  nextDueDate?: Date;
  vetName?: string;
}

export interface PetService {
  id: string;
  petId: string;
  serviceType: ServiceType;
  date: Date;
  price: number;
  location: string;
}

export interface PetNutrition {
  id: string;
  petId: string;
  foodName: string;
  currentStock: number; // in kg
  maxStock: number; // in kg
  dailyAmount: number; // in grams
}
