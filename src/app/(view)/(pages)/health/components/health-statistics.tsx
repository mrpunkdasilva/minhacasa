"use client";

import {
  AlertTriangle,
  BellRing,
  CalendarCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  Package,
  Pill,
  TrendingUp,
} from "lucide-react";
import {
  AppointmentType,
  MedicationSubject,
  MedicationType,
} from "@/app/domain/enums/health/health.enums";
import {
  DoseLog,
  HealthAppointment,
  Medication,
  MedicationAlarm,
  MedicationAlarmOccurrence,
} from "@/app/domain/entity/health/health.entities";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/(view)/components/ui/tabs";
import { toDateKey } from "./health-utils";

interface HealthStatisticsProps {
  medications: Medication[];
  alarms: MedicationAlarm[];
  occurrences: MedicationAlarmOccurrence[];
  doseLogs: DoseLog[];
  appointments: HealthAppointment[];
  houseMembers: { id: string; name: string }[];
  now: string;
}

interface StatisticsSummaryProps {
  medications: Medication[];
  alarms: MedicationAlarm[];
  occurrences: MedicationAlarmOccurrence[];
  doseLogs: DoseLog[];
  appointments: HealthAppointment[];
  showAppointments: boolean;
  now: string;
}

function StatisticsSummary({
  medications,
  alarms,
  occurrences,
  doseLogs,
  appointments,
  showAppointments,
  now,
}: StatisticsSummaryProps) {
  const safeMedications = Array.isArray(medications) ? medications : [];
  const safeAlarms = Array.isArray(alarms) ? alarms : [];
  const safeOccurrences = Array.isArray(occurrences) ? occurrences : [];
  const safeLogs = Array.isArray(doseLogs) ? doseLogs : [];
  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const nowDate = new Date(now);
  const currentTime = `${`${nowDate.getHours()}`.padStart(2, "0")}:${`${nowDate.getMinutes()}`.padStart(2, "0")}`;
  const startOfToday = new Date(nowDate);
  startOfToday.setHours(0, 0, 0, 0);
  const inSevenDays = new Date(startOfToday);
  inSevenDays.setDate(inSevenDays.getDate() + 7);

  const activeMedications = safeMedications.filter((med) => med.active);
  const takenSet = new Set(
    safeLogs
      .filter((log) => log.takenAt)
      .map((log) => `${log.medId}|${log.date}|${log.time}`),
  );
  const visibleOccurrences = safeOccurrences.filter(
    (occurrence) => occurrence.status !== "dismissed",
  );
  const takenDoses = visibleOccurrences.filter(
    (occurrence) =>
      occurrence.status === "taken" ||
      takenSet.has(
        `${occurrence.medicationId}|${occurrence.date}|${occurrence.time}`,
      ),
  ).length;
  const overdueDoses = visibleOccurrences.filter(
    (occurrence) =>
      occurrence.status === "pending" && occurrence.time < currentTime,
  ).length;
  const adherence = visibleOccurrences.length
    ? Math.round((takenDoses / visibleOccurrences.length) * 100)
    : 0;

  const upcomingAppointments = safeAppointments.filter((item) => {
    const date = new Date(item.date);
    return !item.completed && date >= startOfToday;
  });
  const missedAppointments = safeAppointments.filter((item) => {
    const date = new Date(item.date);
    return !item.completed && date < startOfToday;
  });
  const weekAppointments = upcomingAppointments.filter((item) => {
    const date = new Date(item.date);
    return date <= inSevenDays;
  });
  const completedAppointments = safeAppointments.filter(
    (item) => item.completed,
  ).length;

  const outOfStock = activeMedications.filter(
    (med) => med.stock && med.stock.current <= 0,
  ).length;
  const lowStock = activeMedications.filter(
    (med) =>
      med.stock &&
      med.stock.min > 0 &&
      med.stock.current > 0 &&
      med.stock.current <= med.stock.min,
  ).length;
  const expired = activeMedications.filter(
    (med) => med.expirationDate && new Date(med.expirationDate) < nowDate,
  ).length;
  const expiringSoon = activeMedications.filter((med) => {
    if (!med.expirationDate) return false;
    const date = new Date(med.expirationDate);
    return date >= nowDate && date <= inSevenDays;
  }).length;

  const weeklyLogs = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(startOfToday);
    day.setDate(day.getDate() - (6 - index));
    const key = toDateKey(day);
    return {
      key,
      label: day.toLocaleDateString("pt-BR", { weekday: "short" }),
      count: safeLogs.filter((log) => log.takenAt && log.date === key).length,
    };
  });
  const maxWeeklyLogs = Math.max(1, ...weeklyLogs.map((day) => day.count));

  const subjectCounts = (Object.values(MedicationSubject) as string[]).map(
    (subject) => ({
      label: subject,
      count: safeMedications.filter((med) => med.subject === subject).length,
    }),
  );
  const typeCounts = (Object.values(MedicationType) as string[])
    .map((type) => ({
      label: type,
      count: safeMedications.filter((med) => med.type === type).length,
    }))
    .filter((item) => item.count > 0);
  const appointmentTypeCounts = (Object.values(AppointmentType) as string[])
    .map((type) => ({
      label: type,
      count: safeAppointments.filter((item) => item.type === type).length,
    }))
    .filter((item) => item.count > 0);

  const cards = [
    {
      label: "Medicamentos ativos",
      value: activeMedications.length,
      hint: `${safeMedications.length - activeMedications.length} inativos`,
      icon: Pill,
      tone: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Doses de hoje",
      value: visibleOccurrences.length,
      hint: `${overdueDoses} atrasada(s)`,
      icon: Clock,
      tone: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "Adesão hoje",
      value: `${adherence}%`,
      hint: `${takenDoses} de ${visibleOccurrences.length} tomadas`,
      icon: CheckCircle2,
      tone: "text-emerald-500 bg-emerald-500/10",
    },
    ...(showAppointments
      ? [
          {
            label: "Consultas próximas",
            value: weekAppointments.length,
            hint: `${upcomingAppointments.length} no total`,
            icon: CalendarCheck,
            tone: "text-violet-500 bg-violet-500/10",
          },
        ]
      : []),
    {
      label: "Alarmes recorrentes",
      value: safeAlarms.filter((alarm) => alarm.enabled).length,
      hint: `${safeAlarms.length} regras cadastradas`,
      icon: BellRing,
      tone: "text-sky-500 bg-sky-500/10",
    },
    {
      label: "Estoque em atenção",
      value: outOfStock + lowStock,
      hint: `${outOfStock} esgotado(s) · ${lowStock} baixo(s)`,
      icon: Package,
      tone: "text-rose-500 bg-rose-500/10",
    },
  ];

  const alerts = [
    {
      label: "Medicamentos vencidos",
      value: expired,
      icon: AlertTriangle,
      tone: "text-rose-500",
    },
    {
      label: "Vencendo em 7 dias",
      value: expiringSoon,
      icon: Clock,
      tone: "text-amber-500",
    },
    ...(showAppointments
      ? [
          {
            label: "Consultas perdidas",
            value: missedAppointments.length,
            icon: CalendarCheck,
            tone: "text-rose-500",
          },
          {
            label: "Consultas concluídas",
            value: completedAppointments,
            icon: CheckCircle2,
            tone: "text-emerald-500",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-2 font-mono text-3xl font-black text-white">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-600">{card.hint}</p>
                </div>
                <div className={`rounded-lg p-2 ${card.tone}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={16} />
            <h2 className="font-bold text-white">
              Doses registradas nos últimos 7 dias
            </h2>
          </div>
          <div className="mt-6 flex h-40 items-end gap-2">
            {weeklyLogs.map((day) => (
              <div
                key={day.key}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="font-mono text-[10px] text-zinc-500">
                  {day.count}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-emerald-500/70 transition-all"
                    style={{
                      height: `${Math.max(4, (day.count / maxWeeklyLogs) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] uppercase text-zinc-600">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2">
            <HeartPulse className="text-sky-500" size={16} />
            <h2 className="font-bold text-white">
              Distribuição dos medicamentos
            </h2>
          </div>
          <div className="mt-5 space-y-4">
            {subjectCounts.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="font-mono font-bold text-white">
                    {item.count}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-sky-500/70"
                    style={{
                      width: `${safeMedications.length ? (item.count / safeMedications.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {typeCounts.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {typeCounts.map((item) => (
                <span
                  key={item.label}
                  className="rounded-full border border-zinc-800 bg-black/30 px-2 py-1 text-[10px] text-zinc-400"
                >
                  {item.label}:{" "}
                  <span className="font-mono font-bold text-white">
                    {item.count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="font-bold text-white">Saúde em alerta</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.label}
                className="rounded-lg border border-zinc-800 bg-black/20 p-4"
              >
                <Icon className={alert.tone} size={16} />
                <p className="mt-3 font-mono text-2xl font-black text-white">
                  {alert.value}
                </p>
                <p className="text-[10px] text-zinc-500">{alert.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {showAppointments && appointmentTypeCounts.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="font-bold text-white">Consultas por tipo</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {appointmentTypeCounts.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/20 px-4 py-3"
              >
                <span className="text-xs text-zinc-400">{item.label}</span>
                <span className="font-mono font-black text-white">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HealthStatistics({
  medications,
  alarms,
  occurrences,
  doseLogs,
  appointments,
  houseMembers,
  now,
}: HealthStatisticsProps) {
  const safeMedications = Array.isArray(medications) ? medications : [];
  const safeAlarms = Array.isArray(alarms) ? alarms : [];
  const safeOccurrences = Array.isArray(occurrences) ? occurrences : [];
  const safeLogs = Array.isArray(doseLogs) ? doseLogs : [];
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeMembers = Array.isArray(houseMembers) ? houseMembers : [];

  const scopes = [
    {
      key: "geral",
      label: "Geral",
      medications: safeMedications,
      alarms: safeAlarms,
      occurrences: safeOccurrences,
      doseLogs: safeLogs,
      appointments: safeAppointments,
      showAppointments: true,
    },
    ...safeMembers.map((member, index) => {
      const memberMedications = safeMedications.filter(
        (med) =>
          med.subject === MedicationSubject.HUMAN &&
          med.subjectName?.trim().toLowerCase() ===
            member.name.trim().toLowerCase(),
      );
      const medicationIds = new Set(memberMedications.map((med) => med.id));

      return {
        key: member.id || `morador-${index}`,
        label: member.name,
        medications: memberMedications,
        alarms: safeAlarms.filter((alarm) =>
          medicationIds.has(alarm.medicationId),
        ),
        occurrences: safeOccurrences.filter((occurrence) =>
          medicationIds.has(occurrence.medicationId),
        ),
        doseLogs: safeLogs.filter((log) => medicationIds.has(log.medId)),
        appointments: [] as HealthAppointment[],
        showAppointments: false,
      };
    }),
  ];

  return (
    <Tabs defaultValue="geral" className="w-full">
      <TabsList
        variant="line"
        className="h-auto w-full justify-start gap-4 rounded-none border-b border-zinc-800 p-0"
      >
        {scopes.map((scope) => (
          <TabsTrigger
            key={scope.key}
            value={scope.key}
            className="pb-3 text-sm data-[active]:after:bg-emerald-500 data-[active]:text-emerald-400"
          >
            {scope.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {scopes.map((scope) => (
        <TabsContent key={scope.key} value={scope.key} className="pt-6">
          {!scope.showAppointments && (
            <p className="mb-4 text-[11px] text-zinc-500">
              Consultas são registradas para toda a casa e aparecem na aba
              Geral.
            </p>
          )}
          <StatisticsSummary
            medications={scope.medications}
            alarms={scope.alarms}
            occurrences={scope.occurrences}
            doseLogs={scope.doseLogs}
            appointments={scope.appointments}
            showAppointments={scope.showAppointments}
            now={now}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
