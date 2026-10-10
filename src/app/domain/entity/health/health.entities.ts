import {
  MedicationSubject,
  MedicationType,
  DosageUnit,
  AppointmentType,
} from "../../enums/health/health.enums";
import { BaseEntity } from "../base.entity";

export interface StockInfo {
  current: number;
  min: number;
}

export interface Medication extends BaseEntity {
  houseId: string;
  name: string;
  subject: MedicationSubject;
  subjectName?: string;
  petId?: string;
  type: MedicationType;
  dosage: number;
  dosageUnit: DosageUnit;
  startTime: string;
  intervalHours: number;
  startDate: Date;
  endDate?: Date;
  stock?: StockInfo;
  expirationDate?: Date;
  instructions?: string;
  active: boolean;
}

export interface DoseLog extends BaseEntity {
  medId: string;
  date: string;
  time: string;
  takenAt?: Date;
}

export interface HealthAppointment extends BaseEntity {
  houseId: string;
  title: string;
  type: AppointmentType;
  date: Date;
  location?: string;
  doctorName?: string;
  notes?: string;
  reminderDaysBefore: number;
  completed: boolean;
}
