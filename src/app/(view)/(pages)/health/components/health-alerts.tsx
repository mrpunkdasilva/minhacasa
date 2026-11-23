"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Medication,
  MedicationAlarm,
  MedicationAlarmOccurrence,
  DoseLog,
  HealthAppointment,
} from "@/app/domain/entity/health/health.entities";
import {
  deleteAlarmOccurrence,
  deleteMedicationAlarm,
  setDoseTaken,
} from "@/app/infra/actions/health.actions";
import {
  AlarmClock,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Pill,
  Trash2,
} from "lucide-react";
import MedicationFormDialog from "./medication-form-dialog";
import MedicationAlarmFormDialog from "./medication-alarm-form-dialog";
import {
  DoseSlot,
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
import { ConfirmDialog } from "./feedback-dialogs";

interface HealthAlertsProps {
  medications: Medication[];
  doseLogs: DoseLog[];
  appointments: HealthAppointment[];
  alarms?: MedicationAlarm[];
  occurrences?: MedicationAlarmOccurrence[];
}

export default function HealthAlerts({
  medications,
  doseLogs,
  appointments,
  alarms = [],
  occurrences,
}: HealthAlertsProps) {
  const [isPending, startTransition] = useTransition();
  const [slotToDelete, setSlotToDelete] = useState<DoseSlot | null>(null);

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
  const safeAlarms = useMemo(
    () => (Array.isArray(alarms) ? alarms : []),
    [alarms],
  );

  const todaySlots = getTodayDoseSlots(
    safeMeds,
    safeLogs,
    safeAlarms,
    occurrences,
  );
  const pendingSlots = todaySlots.filter((slot) => !slot.taken);
  const overdueSlots = todaySlots.filter((slot) => isOverdueSlot(slot));
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

  const hasOtherAlerts =
    lowStockMeds.length > 0 ||
    expiringMeds.length > 0 ||
    upcomingAppointments.length > 0;

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

  const handleDeleteAlarm = () => {
    if (!slotToDelete) return;
    startTransition(async () => {
      if (slotToDelete.occurrenceId) {
        await deleteAlarmOccurrence(slotToDelete.occurrenceId);
      } else if (slotToDelete.alarm) {
        await deleteMedicationAlarm(slotToDelete.alarm.id);
      }
      setSlotToDelete(null);
    });
  };

  const stats = [
    {
      label: "Pendentes",
      value: pendingSlots.length,
      color: "text-emerald-500",
    },
    { label: "Atrasados", value: overdueSlots.length, color: "text-rose-500" },
    { label: "Tomados", value: takenSlots.length, color: "text-zinc-300" },
    {
      label: "Estoque baixo",
      value: lowStockMeds.length,
      color: "text-amber-500",
    },
    { label: "Validade", value: expiringMeds.length, color: "text-amber-500" },
    {
      label: "Consultas",
      value: upcomingAppointments.length,
      color: "text-emerald-500",
    },
  ];

  const renderAlarm = (slot: DoseSlot) => {
    const overdue = !slot.taken && isOverdueSlot(slot);
    const status = slot.taken
      ? {
          label: "Tomado",
          className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
          Icon: CheckCircle2,
        }
      : overdue
        ? {
            label: "Atrasado",
            className: "bg-rose-500/10 text-rose-500 border-rose-500/30",
            Icon: AlarmClock,
          }
        : {
            label: "Pendente",
            className: "bg-zinc-800 text-zinc-400 border-zinc-700",
            Icon: Clock,
          };

    return (
      <div
        key={slot.occurrenceId ?? `${slot.med.id}-${slot.time}`}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
          overdue
            ? "border-rose-500/40 bg-rose-500/5"
            : "border-zinc-800 bg-zinc-900"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            checked={slot.taken}
            disabled={isPending}
            onChange={(event) =>
              handleToggle(
                slot.med.id,
                slot.date,
                slot.time,
                event.target.checked,
              )
            }
            aria-label={`Marcar ${slot.med.name} das ${slot.time} como tomado`}
            className="peer w-5 h-5 rounded-lg border-2 border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 appearance-none checked:border-emerald-500 checked:bg-emerald-500 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg font-black text-emerald-500">
                {slot.time}
              </span>
              <span className="font-bold text-white truncate">
                {slot.med.name}
              </span>
              <span
                className={`flex items-center gap-1 text-[9px] font-bold uppercase border px-2 py-0.5 rounded-full ${status.className}`}
              >
                <status.Icon size={10} /> {status.label}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {slot.med.subjectName ? `${slot.med.subjectName} · ` : ""}
              {slot.med.dosage} {slot.med.dosageUnit}
              {slot.alarm?.note ? ` · ${slot.alarm.note}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 shrink-0">
          {slot.alarm ? (
            <MedicationAlarmFormDialog
              medications={safeMeds}
              initialAlarm={slot.alarm}
              triggerClassName="p-1.5"
            />
          ) : (
            <MedicationFormDialog
              initialMedication={slot.med}
              triggerClassName="p-1.5"
            />
          )}
          <button
            onClick={() => setSlotToDelete(slot)}
            disabled={isPending}
            className="p-1.5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Excluir alarme"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BellRing size={18} className="text-emerald-500" /> Alarmes de
                hoje
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Marque como tomado, edite ou exclua cada alarme.
              </p>
            </div>
            <MedicationAlarmFormDialog medications={safeMeds} />
          </div>

          {todaySlots.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <Pill className="mx-auto text-zinc-700 mb-4" size={40} />
              <p className="text-zinc-500 font-medium">
                Nenhum alarme para hoje.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">{todaySlots.map(renderAlarm)}</div>
          )}
        </section>

        {hasOtherAlerts && (
          <section className="space-y-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Outros
              avisos
            </h2>

            {lowStockMeds.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">
                  Estoque baixo
                </h3>
                <div className="grid gap-3">
                  {lowStockMeds.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5"
                    >
                      <div>
                        <p className="font-bold text-white">{med.name}</p>
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
              </div>
            )}

            {expiringMeds.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">
                  Validade
                </h3>
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
              </div>
            )}

            {upcomingAppointments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                  Consultas e exames
                </h3>
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
              </div>
            )}
          </section>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(slotToDelete)}
        onOpenChange={(isOpen) => !isOpen && setSlotToDelete(null)}
        title="Excluir alarme?"
        description={`O alarme de ${slotToDelete?.med.name ?? ""} das ${slotToDelete?.time ?? ""} será removido.`}
        loading={isPending}
        onConfirm={handleDeleteAlarm}
      />
    </>
  );
}
