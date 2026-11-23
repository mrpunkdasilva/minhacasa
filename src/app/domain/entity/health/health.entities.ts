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

/** Days use JavaScript weekday indexes: 0 = Sunday, 6 = Saturday. */
export interface MedicationAlarm extends BaseEntity {
  houseId: string;
  medicationId: string;
  time: string;
  daysOfWeek: number[];
  enabled: boolean;
  note?: string;
}

export type AlarmOccurrenceStatus = "pending" | "taken" | "dismissed";

/** A concrete, persisted alarm for one dose on one date and time. */
export interface MedicationAlarmOccurrence extends BaseEntity {
  houseId: string;
  medicationId: string;
  alarmId?: string;
  date: string;
  time: string;
  status: AlarmOccurrenceStatus;
  note?: string;
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
