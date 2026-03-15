import { AssetCategory, SystemType, UtilityType, MaintenanceFrequency } from "../../enums/infrastructure/infrastructure.enums";

export interface HomeAsset {
  id: string;
  name: string;
  category: AssetCategory;
  purchaseDate?: Date;
  warrantyUntil?: Date;
  manualUrl?: string;
  description?: string;
  location: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  lastPerformedDate: Date;
  nextDueDate: Date;
  frequency: MaintenanceFrequency;
  status: "ok" | "warning" | "overdue";
}

export interface SystemComponent {
  id: string;
  systemType: SystemType;
  name: string;
  location: string;
  details: string; // e.g., "220V", "PPR 20mm", "SSID: Home_WiFi"
}

export interface UtilityReading {
  id: string;
  utilityType: UtilityType;
  readingDate: Date;
  value: number;
  unit: string; // e.g., "m³", "kWh"
}
