import {
  CleaningTask,
  CleaningLog,
} from "@/app/domain/entity/cleaning/cleaning.entities";
import { CleaningFrequency } from "@/app/domain/enums/cleaning/cleaning.enums";
import { HouseRoom } from "@/app/domain/enums/house/house-room";

const now = new Date();

export const cleaningTasksMock: CleaningTask[] = [
  {
    id: "ct-1",
    createdAt: now,
    updatedAt: now,
    title: "Lavar a Louça",
    description: "Lavar, secar e guardar toda a louça do dia.",
    room: HouseRoom.KITCHEN,
    frequency: CleaningFrequency.DAILY,
    estimatedTime: { value: 20, unit: "min" },
    isHeavyCleaning: false,
  },
  {
    id: "ct-2",
    createdAt: now,
    updatedAt: now,
    title: "Aspirar a Sala",
    description: "Passar aspirador em todo o piso e tapetes da sala.",
    room: HouseRoom.LIVING_ROOM,
    frequency: CleaningFrequency.DAILY,
    estimatedTime: { value: 15, unit: "min" },
    isHeavyCleaning: false,
  },
  {
    id: "ct-3",
    createdAt: now,
    updatedAt: now,
    title: "Trocar Roupa de Cama",
    description: "Retirar lençóis e fronhas sujas e colocar novos.",
    room: HouseRoom.BEDROOM,
    frequency: CleaningFrequency.WEEKLY,
    estimatedTime: { value: 10, unit: "min" },
    isHeavyCleaning: false,
  },
  {
    id: "ct-4",
    createdAt: now,
    updatedAt: now,
    title: "Limpeza Pesada de Banheiro",
    description: "Lavar azulejos, box e desinfetar sanitário.",
    room: HouseRoom.BATHROOM,
    frequency: CleaningFrequency.WEEKLY,
    estimatedTime: { value: 45, unit: "min" },
    isHeavyCleaning: true,
  },
  {
    id: "ct-5",
    createdAt: now,
    updatedAt: now,
    title: "Limpar Vidros das Janelas",
    description: "Limpeza completa interna e externa de todos os vidros.",
    room: HouseRoom.LIVING_ROOM,
    frequency: CleaningFrequency.MONTHLY,
    estimatedTime: { value: 120, unit: "min" },
    isHeavyCleaning: true,
  },
  {
    id: "ct-6",
    createdAt: now,
    updatedAt: now,
    title: "Limpar Interior do Forno",
    description: "Remover gordura acumulada nas paredes internas do forno.",
    room: HouseRoom.KITCHEN,
    frequency: CleaningFrequency.MONTHLY,
    estimatedTime: { value: 60, unit: "min" },
    isHeavyCleaning: true,
  },
];

export const cleaningLogsMock: CleaningLog[] = [
  {
    id: "cl-1",
    createdAt: now,
    updatedAt: now,
    taskId: "ct-5",
    completedAt: new Date("2024-02-15"),
    notes: "Utilizado limpa-vidros spray.",
  },
  {
    id: "cl-2",
    createdAt: now,
    updatedAt: now,
    taskId: "ct-6",
    completedAt: new Date("2024-03-01"),
    notes: "Forno estava bem sujo.",
  },
];
