import { CleaningFrequency, CleaningRoom } from "../../enums/cleaning/cleaning.enums";

export interface CleaningTask {
  id: string;
  title: string;
  description: string;
  room: CleaningRoom;
  frequency: CleaningFrequency;
  estimatedTime?: number; // in minutes
  isHeavyCleaning: boolean;
}

export interface CleaningLog {
  id: string;
  taskId: string;
  completedAt: Date;
  completedBy?: string;
  notes?: string;
}
