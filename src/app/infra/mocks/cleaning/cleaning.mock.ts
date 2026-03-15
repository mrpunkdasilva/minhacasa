import {
  CleaningTask,
  CleaningLog,
} from "@/app/domain/entity/cleaning/cleaning.entities";
import {
  CleaningFrequency,
  CleaningRoom,
} from "@/app/domain/enums/cleaning/cleaning.enums";

export const cleaningTasksMock: CleaningTask[] = [
  {
    id: "ct-1",
    title: "Lavar a Louça",
    description: "Lavar, secar e guardar toda a louça do dia.",
    room: CleaningRoom.KITCHEN,
    frequency: CleaningFrequency.DAILY,
    estimatedTime: 20,
    isHeavyCleaning: false,
  },
  {
    id: "ct-2",
    title: "Aspirar a Sala",
    description: "Passar aspirador em todo o piso e tapetes da sala.",
    room: CleaningRoom.LIVING_ROOM,
    frequency: CleaningFrequency.DAILY,
    estimatedTime: 15,
    isHeavyCleaning: false,
  },
  {
    id: "ct-3",
    title: "Trocar Roupa de Cama",
    description: "Retirar lençóis e fronhas sujas e colocar novos.",
    room: CleaningRoom.BEDROOM,
    frequency: CleaningFrequency.WEEKLY,
    estimatedTime: 10,
    isHeavyCleaning: false,
  },
  {
    id: "ct-4",
    title: "Limpeza Pesada de Banheiro",
    description: "Lavar azulejos, box e desinfetar sanitário.",
    room: CleaningRoom.BATHROOM,
    frequency: CleaningFrequency.WEEKLY,
    estimatedTime: 45,
    isHeavyCleaning: true,
  },
  {
    id: "ct-5",
    title: "Limpar Vidros das Janelas",
    description: "Limpeza completa interna e externa de todos os vidros.",
    room: CleaningRoom.LIVING_ROOM,
    frequency: CleaningFrequency.MONTHLY,
    estimatedTime: 120,
    isHeavyCleaning: true,
  },
  {
    id: "ct-6",
    title: "Limpar Interior do Forno",
    description: "Remover gordura acumulada nas paredes internas do forno.",
    room: CleaningRoom.KITCHEN,
    frequency: CleaningFrequency.MONTHLY,
    estimatedTime: 60,
    isHeavyCleaning: true,
  },
];

export const cleaningLogsMock: CleaningLog[] = [
  {
    id: "cl-1",
    taskId: "ct-5",
    completedAt: new Date("2024-02-15"),
    notes: "Utilizado limpa-vidros spray.",
  },
  {
    id: "cl-2",
    taskId: "ct-6",
    completedAt: new Date("2024-03-01"),
    notes: "Forno estava bem sujo.",
  },
];
