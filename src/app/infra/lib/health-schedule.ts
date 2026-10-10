import { Medication } from "@/app/domain/entity/health/health.entities";

function parseClock(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function toClock(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${`${hours}`.padStart(2, "0")}:${`${mins}`.padStart(2, "0")}`;
}

/**
 * Anchor timestamp for the schedule: treatment startDate at startTime.
 */
function anchorDate(med: Medication): Date {
  const d = new Date(med.startDate);
  d.setHours(0, 0, 0, 0);
  const offset = parseClock(med.startTime);
  d.setHours(Math.floor(offset / 60), offset % 60, 0, 0);
  return d;
}

/**
 * Computes the dose times that fall on the given calendar day, generated
 * automatically from the start date/time and the interval in hours.
 */
export function getDoseTimesForDate(med: Medication, date: Date): string[] {
  if (!med.active || med.intervalHours <= 0) return [];

  const intervalMs = med.intervalHours * 3_600_000;
  const anchor = anchorDate(med);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const targetStart = target.getTime();
  const targetEnd = targetStart + 86_400_000 - 1;

  const end = med.endDate
    ? new Date(med.endDate).setHours(23, 59, 59, 999)
    : Infinity;

  if (anchor.getTime() > targetEnd || anchor.getTime() > end) return [];

  const baseN = Math.max(
    0,
    Math.floor((targetStart - anchor.getTime()) / intervalMs),
  );

  const times: string[] = [];
  for (let n = baseN - 3; n <= baseN + 3; n++) {
    if (n < 0) continue;
    const t = anchor.getTime() + n * intervalMs;
    if (t > end || t > targetEnd) break;
    if (t >= targetStart) {
      times.push(
        toClock(parseClock(med.startTime) + n * (med.intervalHours * 60)),
      );
    }
  }
  return Array.from(new Set(times)).sort();
}
