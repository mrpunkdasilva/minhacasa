import {
  Pet,
  HealthRecord,
  PetService,
  PetNutrition,
} from "@/app/domain/entity/pet/pet.entities";
import {
  PetType,
  PetGender,
  HealthRecordType,
  ServiceType,
} from "@/app/domain/enums/pets/pet.enums";

const now = new Date();

export const petsMock: Pet[] = [
  {
    id: "p-1",
    createdAt: now,
    updatedAt: now,
    name: "Max",
    type: PetType.DOG,
    breed: "Golden Retriever",
    birthDate: new Date("2020-05-15"),
    weight: { value: 32.5, unit: "kg" },
    gender: PetGender.MALE,
  },
  {
    id: "p-2",
    createdAt: now,
    updatedAt: now,
    name: "Luna",
    type: PetType.CAT,
    breed: "Siamês",
    birthDate: new Date("2022-01-10"),
    weight: { value: 4.2, unit: "kg" },
    gender: PetGender.FEMALE,
  },
];

export const healthRecordsMock: HealthRecord[] = [
  {
    id: "hr-1",
    createdAt: now,
    updatedAt: now,
    petId: "p-1",
    type: HealthRecordType.VACCINE,
    description: "V10 - Reforço Anual",
    date: new Date("2024-02-10"),
    nextDueDate: new Date("2025-02-10"),
    vetName: "Dra. Ana Silva",
  },
  {
    id: "hr-2",
    createdAt: now,
    updatedAt: now,
    petId: "p-1",
    type: HealthRecordType.DEWORMING,
    description: "Simparic 20-40kg",
    date: new Date("2024-03-01"),
    nextDueDate: new Date("2024-04-01"),
  },
  {
    id: "hr-3",
    createdAt: now,
    updatedAt: now,
    petId: "p-2",
    type: HealthRecordType.VACCINE,
    description: "V4 - Reforço Anual",
    date: new Date("2023-11-20"),
    nextDueDate: new Date("2024-11-20"),
  },
];

export const petServicesMock: PetService[] = [
  {
    id: "ps-1",
    createdAt: now,
    updatedAt: now,
    petId: "p-1",
    serviceType: ServiceType.BATH,
    date: new Date("2024-03-16"),
    price: { amount: 80.0, currency: "BRL" },
    location: "Pet Shop Alegria",
  },
  {
    id: "ps-2",
    createdAt: now,
    updatedAt: now,
    petId: "p-2",
    serviceType: ServiceType.GROOMING,
    date: new Date("2024-03-20"),
    price: { amount: 120.0, currency: "BRL" },
    location: "Estética Animal",
  },
];

export const petNutritionMock: PetNutrition[] = [
  {
    id: "pn-1",
    petId: "p-1",
    foodName: "Royal Canin Golden Retriever",
    stock: {
      current: 3.5,
      max: 15,
      dailyAmount: 450,
    },
  },
  {
    id: "pn-2",
    petId: "p-2",
    foodName: "Premier Gatos Castrados",
    stock: {
      current: 1.2,
      max: 7.5,
      dailyAmount: 65,
    },
  },
];
