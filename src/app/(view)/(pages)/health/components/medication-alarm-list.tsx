"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Medication,
  MedicationAlarm,
} from "@/app/domain/entity/health/health.entities";
import {
  deleteMedicationAlarm,
  toggleMedicationAlarm,
} from "@/app/infra/actions/health.actions";
import { AlarmClock, BellOff, BellRing, Search, Trash2 } from "lucide-react";
import MedicationAlarmFormDialog from "./medication-alarm-form-dialog";
import { formatDaysOfWeek } from "./health-utils";
import { ConfirmDialog } from "./feedback-dialogs";

interface MedicationAlarmListProps {
  alarms: MedicationAlarm[];
  medications: Medication[];
}

export default function MedicationAlarmList({
  alarms,
  medications,
}: MedicationAlarmListProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [alarmToDelete, setAlarmToDelete] = useState<MedicationAlarm | null>(
    null,
  );

  const safeAlarms = useMemo(
    () => (Array.isArray(alarms) ? alarms : []),
    [alarms],
  );
  const medicationById = useMemo(
    () => new Map(medications.map((med) => [med.id, med])),
    [medications],
  );

  const filtered = safeAlarms.filter((alarm) => {
    const name = medicationById.get(alarm.medicationId)?.name ?? "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      (alarm.note ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = () => {
    if (!alarmToDelete) return;
    startTransition(async () => {
      await deleteMedicationAlarm(alarmToDelete.id);
      setAlarmToDelete(null);
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-zinc-500">
            {safeAlarms.length}{" "}
            {safeAlarms.length === 1
              ? "alarme cadastrado"
              : "alarmes cadastrados"}
          </p>
          <MedicationAlarmFormDialog medications={medications} />
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={16}
          />
          <input
            placeholder="Buscar alarme..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 bg-zinc-900/50 border border-zinc-800 rounded-xl h-10 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <AlarmClock className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 font-medium">
              Nenhum alarme encontrado.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((alarm) => {
              const medication = medicationById.get(alarm.medicationId);
              return (
                <div
                  key={alarm.id}
                  className={`p-5 rounded-xl border transition-all duration-300 ${
                    alarm.enabled
                      ? "bg-zinc-900 border-zinc-800"
                      : "bg-zinc-900/30 border-zinc-900/50 opacity-60"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-bold tracking-tight ${medication ? "text-white" : "text-rose-400"} ${!alarm.enabled ? "line-through text-zinc-500" : ""}`}
                        >
                          {medication?.name ?? "Medicamento removido"}
                        </h3>
                        <span className="text-xl font-black font-mono text-emerald-500">
                          {alarm.time}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter ${
                            alarm.enabled
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {alarm.enabled ? "Ativo" : "Pausado"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500">
                        <span>{formatDaysOfWeek(alarm.daysOfWeek)}</span>
                        {medication && (
                          <span>
                            {medication.dosage} {medication.dosageUnit}
                          </span>
                        )}
                        {medication?.subjectName && (
                          <span>→ {medication.subjectName}</span>
                        )}
                      </div>

                      {alarm.note && (
                        <p className="text-xs text-zinc-600 mt-2 italic">
                          {alarm.note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            await toggleMedicationAlarm(
                              alarm.id,
                              !alarm.enabled,
                            );
                          })
                        }
                        disabled={isPending}
                        className={`p-2 rounded-xl transition-all disabled:opacity-50 ${
                          alarm.enabled
                            ? "text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10"
                            : "text-emerald-500 hover:bg-emerald-500/10"
                        }`}
                        title={
                          alarm.enabled ? "Pausar alarme" : "Ativar alarme"
                        }
                      >
                        {alarm.enabled ? (
                          <BellOff size={18} />
                        ) : (
                          <BellRing size={18} />
                        )}
                      </button>
                      <MedicationAlarmFormDialog
                        medications={medications}
                        initialAlarm={alarm}
                      />
                      <button
                        onClick={() => setAlarmToDelete(alarm)}
                        disabled={isPending}
                        className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50"
                        title="Excluir alarme"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(alarmToDelete)}
        onOpenChange={(isOpen) => !isOpen && setAlarmToDelete(null)}
        title="Excluir alarme?"
        description={`O alarme das ${alarmToDelete?.time ?? ""} será removido.`}
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
