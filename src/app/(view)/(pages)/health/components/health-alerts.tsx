"use client";

import { useMemo, useTransition } from "react";
import {
  Medication,
  DoseLog,
  HealthAppointment,
} from "@/app/domain/entity/health/health.entities";
import { setDoseTaken } from "@/app/infra/actions/health.actions";
import {
  AlertTriangle,
  AlarmClock,
  CheckCircle2,
  PackageMinus,
  Stethoscope,
  Pill,
} from "lucide-react";
import {
  getTodayDoseSlots,
  isOverdueSlot,
  isLowStock,
  isOutOfStock,
  isExpired,
  isExpiringSoon,
  formatDate,
  formatTime,
  daysUntil,
} from "./health-utils";

interface HealthAlertsProps {
  medications: Medication[];
  doseLogs: DoseLog[];
  appointments: HealthAppointment[];
}

export default function HealthAlerts({
  medications,
  doseLogs,
  appointments,
}: HealthAlertsProps) {
  const [isPending, startTransition] = useTransition();

  const safeMeds = useMemo(
    () => (Array.isArray(medications) ? medications : []),
    [medications],
  );
  const safeLogs = useMemo(
    () => (Array.isArray(doseLogs) ? doseLogs : []),
    [doseLogs],
  );
  const safeAppointments = useMemo(
    () => (Array.isArray(appointments) ? appointments : []),
    [appointments],
  );

  const todaySlots = getTodayDoseSlots(safeMeds, safeLogs);
  const overdueSlots = todaySlots.filter((slot) => isOverdueSlot(slot));
  const todayDisplay = todaySlots.filter((slot) => !isOverdueSlot(slot));
  const pendingSlots = todayDisplay.filter((slot) => !slot.taken);
  const takenSlots = todaySlots.filter((slot) => slot.taken);

  const lowStockMeds = safeMeds.filter(
    (med) => med.active && (isLowStock(med) || isOutOfStock(med)),
  );
  const expiringMeds = safeMeds.filter(
    (med) => med.active && (isExpired(med) || isExpiringSoon(med)),
  );
  const upcomingAppointments = safeAppointments
    .filter(
      (item) =>
        !item.completed && daysUntil(item.date) <= item.reminderDaysBefore,
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalAlerts =
    overdueSlots.length +
    lowStockMeds.length +
    expiringMeds.length +
    upcomingAppointments.length;

  const handleToggle = (
    medId: string,
    date: string,
    time: string,
    taken: boolean,
  ) => {
    startTransition(async () => {
      await setDoseTaken(medId, date, time, taken);
    });
  };

  const stats = [
    {
      label: "Doses pendentes",
      value: pendingSlots.length,
      color: "text-emerald-500",
    },
    {
      label: "Doses atrasadas",
      value: overdueSlots.length,
      color: "text-rose-500",
    },
    {
      label: "Estoque baixo",
      value: lowStockMeds.length,
      color: "text-amber-500",
    },
    {
      label: "Validade próxima",
      value: expiringMeds.length,
      color: "text-amber-500",
    },
    {
      label: "Consultas",
      value: upcomingAppointments.length,
      color: "text-emerald-500",
    },
  ];

  const renderDoseRow = (
    slot: ReturnType<typeof getTodayDoseSlots>[number],
  ) => (
    <div
      key={`${slot.med.id}-${slot.time}`}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900"
    >
      <div className="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          checked={slot.taken}
          disabled={isPending}
          onChange={(e) =>
            handleToggle(slot.med.id, slot.date, slot.time, e.target.checked)
          }
          className="peer w-5 h-5 rounded-lg border-2 border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 appearance-none checked:border-emerald-500 checked:bg-emerald-500"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{slot.med.name}</span>
            <span className="text-[11px] font-mono text-emerald-500 font-bold">
              {slot.time}
            </span>
          </div>
          <span className="text-xs text-zinc-500">
            {slot.med.subjectName ? `${slot.med.subjectName} · ` : ""}
            {slot.med.dosage} {slot.med.dosageUnit}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {slot.taken ? (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-500">
            <CheckCircle2 size={12} /> Tomado
          </span>
        ) : isOverdueSlot(slot) ? (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-500">
            <AlarmClock size={12} /> Atrasado
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase text-zinc-500">
            Próxima
          </span>
        )}
      </div>
    </div>
  );

  if (totalAlerts === 0 && todaySlots.length === 0) {
    return (
      <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
        <CheckCircle2 className="mx-auto text-emerald-500/60 mb-4" size={48} />
        <p className="text-zinc-500 font-medium">
          Tudo em dia! Nenhum alerta de saúde agora.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50"
          >
            <p className={`text-2xl font-black font-mono ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {overdueSlots.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-rose-500 flex items-center gap-2 mb-4">
            <AlertTriangle size={18} /> Doses atrasadas de hoje
          </h2>
          <div className="grid gap-3">{overdueSlots.map(renderDoseRow)}</div>
        </section>
      )}

      {todaySlots.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Pill size={18} /> Doses de hoje ({takenSlots.length}/
            {todaySlots.length})
          </h2>
          <div className="grid gap-3">{todayDisplay.map(renderDoseRow)}</div>
        </section>
      )}

      {lowStockMeds.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-amber-500 flex items-center gap-2 mb-4">
            <PackageMinus size={18} /> Estoque baixo
          </h2>
          <div className="grid gap-3">
            {lowStockMeds.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5"
              >
                <div>
                  <p className="font-bold text-white">{med.name}</p>
                  <span className="text-xs text-zinc-500">
                    {med.subjectName ? `${med.subjectName} · ` : ""}
                  </span>
                  <span className="text-xs font-bold text-amber-500">
                    {isOutOfStock(med)
                      ? "Sem estoque"
                      : `Restam ${med.stock?.current} (mín. ${med.stock?.min})`}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-500">
                  Renovar
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {expiringMeds.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-amber-500 flex items-center gap-2 mb-4">
            <AlertTriangle size={18} /> Validade
          </h2>
          <div className="grid gap-3">
            {expiringMeds.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900"
              >
                <div>
                  <p className="font-bold text-white">{med.name}</p>
                  <span className="text-xs text-zinc-500">
                    Valida até {formatDate(med.expirationDate!)}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase ${isExpired(med) ? "text-rose-500" : "text-amber-500"}`}
                >
                  {isExpired(med)
                    ? "Vencido"
                    : `Vence em ${daysUntil(med.expirationDate!)}d`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcomingAppointments.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-emerald-500 flex items-center gap-2 mb-4">
            <Stethoscope size={18} /> Consultas e exames
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingAppointments.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {formatDate(item.date)} às {formatTime(item.date)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-500">
                    {daysUntil(item.date) === 0
                      ? "Hoje"
                      : `Em ${daysUntil(item.date)}d`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
