import {
  PetType,
  PetGender,
  HealthRecordType,
  ServiceType,
} from "../../enums/pets/pet.enums";
import { BaseEntity } from "../base.entity";
import { Money } from "../invoice/invoice.entity";

export interface WeightInfo {
  value: number;
  unit: "kg" | "g";
}

export interface Pet extends BaseEntity {
  name: string;
  type: PetType;
  breed: string;
  birthDate: Date;
  weight: WeightInfo;
  gender: PetGender;
  avatar?: string;
}

export interface HealthRecord extends BaseEntity {
  petId: string;
  type: HealthRecordType;
  description: string;
  date: Date;
  nextDueDate?: Date;
  vetName?: string;
}

export interface PetService extends BaseEntity {
  petId: string;
  serviceType: ServiceType;
  date: Date;
  price: Money;
  location: string;
}

export interface StockInfo {
  current: number;
  max: number;
  dailyAmount: number;
}

export interface PetNutrition {
  id: string;
  petId: string;
  foodName: string;
  stock: StockInfo;
}
