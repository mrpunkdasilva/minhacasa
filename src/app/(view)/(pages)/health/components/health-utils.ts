import {
  Medication,
  MedicationAlarm,
  MedicationAlarmOccurrence,
  DoseLog,
} from "@/app/domain/entity/health/health.entities";

export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function toDateKey(date: Date): string {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function nowTime(): string {
  const d = new Date();
  return `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(
    2,
    "0",
  )}`;
}

export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export interface DoseSlot {
  med: Medication;
  date: string;
  time: string;
  taken: boolean;
  overdue: boolean;
  alarm?: MedicationAlarm;
  occurrenceId?: string;
}

export function alarmRunsOnDate(
  alarm: MedicationAlarm,
  date: Date = new Date(),
): boolean {
  return alarm.enabled && alarm.daysOfWeek.includes(date.getDay());
}

export function alarmsForMedicationOnDate(
  alarms: MedicationAlarm[],
  medicationId: string,
  date: Date = new Date(),
): MedicationAlarm[] {
  return alarms.filter(
    (alarm) =>
      alarm.medicationId === medicationId && alarmRunsOnDate(alarm, date),
  );
}

export function formatDaysOfWeek(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return "Todos os dias";
  if (
    sorted.length === 5 &&
    [1, 2, 3, 4, 5].every((day) => sorted.includes(day))
  )
    return "Dias úteis";
  if (sorted.length === 0) return "-";
  return sorted.map((day) => WEEKDAY_LABELS[day]).join(", ");
}

/**
 * Doses of today. When persisted occurrences are provided they are the source
 * of truth: each one is an alarm that can be removed individually, even when
 * it is overdue. Otherwise the schedule is computed on the fly as a fallback.
 */
export function getTodayDoseSlots(
  medications: Medication[],
  doseLogs: DoseLog[],
  alarms: MedicationAlarm[] = [],
  occurrences?: MedicationAlarmOccurrence[],
): DoseSlot[] {
  const now = new Date();
  const date = toDateKey(now);
  const takenSet = new Set(
    doseLogs
      .filter((log) => log.takenAt)
      .map((log) => `${log.medId}|${log.date}|${log.time}`),
  );
  const activeMeds = medications.filter((med) => med.active);
  const medById = new Map(activeMeds.map((med) => [med.id, med]));

  let slots: DoseSlot[];
  if (occurrences) {
    slots = occurrences
      .filter(
        (occurrence) =>
          occurrence.date === date &&
          occurrence.status !== "dismissed" &&
          medById.has(occurrence.medicationId),
      )
      .map((occurrence) => ({
        med: medById.get(occurrence.medicationId)!,
        date: occurrence.date,
        time: occurrence.time,
        taken:
          occurrence.status === "taken" ||
          takenSet.has(
            `${occurrence.medicationId}|${occurrence.date}|${occurrence.time}`,
          ),
        overdue: false,
        alarm: alarms.find((alarm) => alarm.id === occurrence.alarmId),
        occurrenceId: occurrence.id,
      }));
  } else {
    slots = activeMeds.flatMap((med) => {
      const dayAlarms = alarmsForMedicationOnDate(alarms, med.id, now);
      const times = dayAlarms.length
        ? dayAlarms.map((alarm) => alarm.time)
        : dayTimes(med);

      return times.map((time) => {
        const slot: DoseSlot = {
          med,
          date,
          time,
          taken: takenSet.has(`${med.id}|${date}|${time}`),
          overdue: false,
          alarm: dayAlarms.find((alarm) => alarm.time === time),
        };
        return slot;
      });
    });
  }

  return slots
    .filter(
      (slot, index) =>
        slots.findIndex(
          (other) => other.med.id === slot.med.id && other.time === slot.time,
        ) === index,
    )
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Read-only accessor for the dose times computed by the API. Falls back to an
 * empty list when the medication does not carry the resolved schedule.
 */
export function dayTimes(med: Medication): string[] {
  const times = (med as Medication & { todayTimes?: string[] }).todayTimes;
  return Array.isArray(times) ? times : [];
}

export function isOverdueSlot(slot: DoseSlot): boolean {
  return !slot.taken && slot.time < nowTime();
}

export function isLowStock(med: Medication): boolean {
  if (!med.stock || med.stock.min <= 0) return false;
  return med.stock.current <= med.stock.min;
}

export function isOutOfStock(med: Medication): boolean {
  if (!med.stock) return false;
  return med.stock.current <= 0;
}

export function isExpired(med: Medication): boolean {
  if (!med.expirationDate) return false;
  return daysUntil(med.expirationDate) < 0;
}

export function isExpiringSoon(med: Medication, days = 30): boolean {
  if (!med.expirationDate) return false;
  const until = daysUntil(med.expirationDate);
  return until >= 0 && until <= days;
}

export function formatDate(date: Date): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR");
}

export function formatTime(date: Date): string {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
