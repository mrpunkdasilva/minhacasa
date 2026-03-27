import {
  AssetCategory,
  SystemType,
  UtilityType,
  MaintenanceFrequency,
  MaintenanceStatus,
  UtilityUnit,
} from "../../enums/infrastructure/infrastructure.enums";
import { HouseRoom } from "../../enums/house/house-room";
import { BaseEntity } from "../base.entity";

export interface HomeAsset extends BaseEntity {
  name: string;
  category: AssetCategory;
  purchaseDate?: Date;
  warrantyUntil?: Date;
  manualUrl?: string;
  description?: string;
  location: HouseRoom;
}

export interface MaintenanceTask extends BaseEntity {
  title: string;
  description: string;
  lastPerformedDate: Date;
  nextDueDate: Date;
  frequency: MaintenanceFrequency;
  status: MaintenanceStatus;
}

export interface SystemComponent {
  id: string;
  systemType: SystemType;
  name: string;
  location: string;
  details: string;
}

export interface UtilityReading {
  id: string;
  utilityType: UtilityType;
  readingDate: Date;
  value: number;
  unit: UtilityUnit;
}
