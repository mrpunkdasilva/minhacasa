import {
  Medication,
  DoseLog,
} from "@/app/domain/entity/health/health.entities";

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
}

/**
 * Doses of today from the schedule computed by the API. The front only maps
 * the pre-calculated times together with the taken logs for display.
 */
export function getTodayDoseSlots(
  medications: Medication[],
  doseLogs: DoseLog[],
): DoseSlot[] {
  const date = toDateKey(new Date());
  const takenSet = new Set(
    doseLogs
      .filter((log) => log.takenAt)
      .map((log) => `${log.medId}|${log.date}|${log.time}`),
  );

  return medications
    .filter((med) => med.active)
    .flatMap((med) => {
      const times = dayTimes(med);
      return times.map((time) => {
        const slot: DoseSlot = {
          med,
          date,
          time,
          taken: takenSet.has(`${med.id}|${date}|${time}`),
          overdue: false,
        };
        return slot;
      });
    })
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
