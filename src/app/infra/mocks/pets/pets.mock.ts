import {
  Pet,
  HealthRecord,
  PetService,
  PetNutrition,
} from "@/app/domain/entity/pet/pet.entities";
import {
  PetType,
  HealthRecordType,
  ServiceType,
} from "@/app/domain/enums/pets/pet.enums";

export const petsMock: Pet[] = [
  {
    id: "p-1",
    name: "Max",
    type: PetType.DOG,
    breed: "Golden Retriever",
    birthDate: new Date("2020-05-15"),
    weight: 32.5,
    gender: "Macho",
  },
  {
    id: "p-2",
    name: "Luna",
    type: PetType.CAT,
    breed: "Siamês",
    birthDate: new Date("2022-01-10"),
    weight: 4.2,
    gender: "Fêmea",
  },
];

export const healthRecordsMock: HealthRecord[] = [
  {
    id: "hr-1",
    petId: "p-1",
    type: HealthRecordType.VACCINE,
    description: "V10 - Reforço Anual",
    date: new Date("2024-02-10"),
    nextDueDate: new Date("2025-02-10"),
    vetName: "Dra. Ana Silva",
  },
  {
    id: "hr-2",
    petId: "p-1",
    type: HealthRecordType.DEWORMING,
    description: "Simparic 20-40kg",
    date: new Date("2024-03-01"),
    nextDueDate: new Date("2024-04-01"),
  },
  {
    id: "hr-3",
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
    petId: "p-1",
    serviceType: ServiceType.BATH,
    date: new Date("2024-03-16"),
    price: 80.0,
    location: "Pet Shop Alegria",
  },
  {
    id: "ps-2",
    petId: "p-2",
    serviceType: ServiceType.GROOMING,
    date: new Date("2024-03-20"),
    price: 120.0,
    location: "Estética Animal",
  },
];

export const petNutritionMock: PetNutrition[] = [
  {
    id: "pn-1",
    petId: "p-1",
    foodName: "Royal Canin Golden Retriever",
    currentStock: 3.5,
    maxStock: 15,
    dailyAmount: 450,
  },
  {
    id: "pn-2",
    petId: "p-2",
    foodName: "Premier Gatos Castrados",
    currentStock: 1.2,
    maxStock: 7.5,
    dailyAmount: 65,
  },
];
