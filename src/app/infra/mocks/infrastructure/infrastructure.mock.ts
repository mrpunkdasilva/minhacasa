import {
  HomeAsset,
  MaintenanceTask,
  SystemComponent,
  UtilityReading,
} from "@/app/domain/entity/infrastructure/infrastructure.entities";
import {
  AssetCategory,
  SystemType,
  UtilityType,
  MaintenanceFrequency,
  MaintenanceStatus,
  UtilityUnit,
} from "@/app/domain/enums/infrastructure/infrastructure.enums";
import { HouseRoom } from "@/app/domain/enums/house/house-room";

const now = new Date();

export const assetsMock: HomeAsset[] = [
  {
    id: "as-1",
    createdAt: now,
    updatedAt: now,
    name: "Geladeira Samsung French Door",
    category: AssetCategory.APPLIANCE,
    location: HouseRoom.KITCHEN,
    purchaseDate: new Date("2023-01-15"),
    warrantyUntil: new Date("2025-01-15"),
    description: "Modelo Inverter, 220V",
  },
  {
    id: "as-2",
    createdAt: now,
    updatedAt: now,
    name: "Ar-Condicionado LG Dual Inverter",
    category: AssetCategory.HVAC,
    location: HouseRoom.BEDROOM,
    purchaseDate: new Date("2022-11-10"),
    warrantyUntil: new Date("2023-11-10"), // Warranty expired
    description: "12000 BTUs",
  },
  {
    id: "as-3",
    createdAt: now,
    updatedAt: now,
    name: "Smart TV LG 65' OLED",
    category: AssetCategory.ELECTRONICS,
    location: HouseRoom.LIVING_ROOM,
    purchaseDate: new Date("2023-05-20"),
    warrantyUntil: new Date("2024-05-20"),
  },
];

export const maintenanceTasksMock: MaintenanceTask[] = [
  {
    id: "mt-1",
    createdAt: now,
    updatedAt: now,
    title: "Limpeza Filtro Ar-Condicionado",
    description: "Lavar filtros de tela das unidades evaporadoras.",
    lastPerformedDate: new Date("2024-02-01"),
    nextDueDate: new Date("2024-04-01"),
    frequency: MaintenanceFrequency.QUARTERLY,
    status: MaintenanceStatus.OK,
  },
  {
    id: "mt-2",
    createdAt: now,
    updatedAt: now,
    title: "Troca de Filtro de Água (Geladeira)",
    description: "Substituir refil interno de carvão ativado.",
    lastPerformedDate: new Date("2023-09-15"),
    nextDueDate: new Date("2024-03-15"), // Due today
    frequency: MaintenanceFrequency.SEMI_ANNUAL,
    status: MaintenanceStatus.WARNING,
  },
  {
    id: "mt-3",
    createdAt: now,
    updatedAt: now,
    title: "Inspeção de Telhado e Calhas",
    description: "Limpar folhas e verificar telhas quebradas antes da chuva.",
    lastPerformedDate: new Date("2023-06-10"),
    nextDueDate: new Date("2024-01-10"), // Overdue
    frequency: MaintenanceFrequency.ANNUAL,
    status: MaintenanceStatus.OVERDUE,
  },
];

export const systemComponentsMock: SystemComponent[] = [
  {
    id: "sc-1",
    systemType: SystemType.ELECTRICAL,
    name: "Quadro de Distribuição Principal",
    location: "Lavanderia",
    details: "Barramento 100A, Monofásico 220V",
  },
  {
    id: "sc-2",
    systemType: SystemType.NETWORK,
    name: "Roteador Principal (VIVO Fiber)",
    location: "Escritório",
    details: "WiFi: MinhaCasa_5G | Senha: *********",
  },
  {
    id: "sc-3",
    systemType: SystemType.GAS,
    name: "Aquecedor de Passagem Rinnai",
    location: "Área Externa",
    details: "Gás Natural (GN), Vazão 20L/min",
  },
];

export const utilityReadingsMock: UtilityReading[] = [
  {
    id: "ur-1",
    utilityType: UtilityType.WATER,
    readingDate: new Date("2024-03-01"),
    value: 1254.3,
    unit: UtilityUnit.M3,
  },
  {
    id: "ur-2",
    utilityType: UtilityType.ELECTRICITY,
    readingDate: new Date("2024-03-01"),
    value: 8945.7,
    unit: UtilityUnit.KWH,
  },
  {
    id: "ur-3",
    utilityType: UtilityType.GAS,
    readingDate: new Date("2024-03-01"),
    value: 452.1,
    unit: UtilityUnit.M3,
  },
];
