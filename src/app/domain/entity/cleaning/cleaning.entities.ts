import { CleaningFrequency } from "../../enums/cleaning/cleaning.enums";
import { HouseRoom } from "../../enums/house/house-room";
import { BaseEntity } from "../base.entity";

export interface EstimatedTime {
  value: number;
  unit: "min" | "h";
}

export interface CleaningTask extends BaseEntity {
  title: string;
  description: string;
  room: HouseRoom;
  frequency: CleaningFrequency;
  estimatedTime?: EstimatedTime;
  isHeavyCleaning: boolean;
}

export interface CleaningLog extends BaseEntity {
  taskId: string;
  completedAt: Date;
  completedBy?: string;
  notes?: string;
}
