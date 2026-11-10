"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Medication,
  DoseLog,
} from "@/app/domain/entity/health/health.entities";
import { MedicationSubject } from "@/app/domain/enums/health/health.enums";
import {
  deleteMedication,
  toggleMedicationActive,
  setDoseTaken,
} from "@/app/infra/actions/health.actions";
import {
  Trash2,
  Search,
  Stethoscope,
  CalendarOff,
  ShieldCheck,
} from "lucide-react";
import MedicationFormDialog from "./medication-form-dialog";
import {
  getTodayDoseSlots,
  isOverdueSlot,
  isLowStock,
  isOutOfStock,
  isExpired,
  isExpiringSoon,
  formatDate,
} from "./health-utils";

interface MedicationListProps {
  medications: Medication[];
  doseLogs: DoseLog[];
  pets?: { id: string; name: string }[];
  houseMembers?: { id: string; name: string }[];
}

export default function MedicationList({
  medications,
  doseLogs,
  pets = [],
  houseMembers = [],
}: MedicationListProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const safeMedications = useMemo(
    () => (Array.isArray(medications) ? medications : []),
    [medications],
  );
  const safeLogs = useMemo(
    () => (Array.isArray(doseLogs) ? doseLogs : []),
    [doseLogs],
  );

  const subjectBadge = {
    [MedicationSubject.GENERAL]: "bg-zinc-800 text-zinc-400 border-zinc-700",
    [MedicationSubject.HUMAN]:
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    [MedicationSubject.PET]:
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  const filtered = safeMedications.filter((med) =>
    med.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este medicamento?")) {
      startTransition(async () => {
        await deleteMedication(id);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-xs text-zinc-500">
          {safeMedications.length}{" "}
          {safeMedications.length === 1
            ? "medicamento cadastrado"
            : "medicamentos cadastrados"}
        </p>
        <MedicationFormDialog pets={pets} houseMembers={houseMembers} />
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          size={16}
        />
        <input
          placeholder="Buscar medicamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 bg-zinc-900/50 border border-zinc-800 rounded-xl h-10 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <Stethoscope className="mx-auto text-zinc-700 mb-4" size={48} />
          <p className="text-zinc-500 font-medium">
            Nenhum medicamento encontrado.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((med) => {
            const todaySlots = getTodayDoseSlots([med], safeLogs);
            const takenToday = todaySlots.filter((slot) => slot.taken);
            const expired = isExpired(med);
            const expiringSoon = isExpiringSoon(med);
            const lowStock = isLowStock(med);
            const outOfStock = isOutOfStock(med);

            return (
              <div
                key={med.id}
                className={`group p-5 rounded-xl border transition-all duration-300 ${
                  med.active
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-zinc-900/30 border-zinc-900/50 opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-bold tracking-tight text-white ${!med.active ? "line-through text-zinc-500" : ""}`}
                      >
                        {med.name}
                      </h3>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter ${
                          subjectBadge[med.subject]
                        }`}
                      >
                        {med.subject}
                      </span>
                      {med.subjectName && (
                        <span className="text-[11px] text-zinc-400 font-medium">
                          → {med.subjectName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500">
                      <span>
                        {med.dosage} {med.dosageUnit}
                      </span>
                      <span className="font-mono">
                        {med.startTime} · a cada {med.intervalHours}h
                      </span>
                      {med.stock && (
                        <span
                          className={`font-bold ${outOfStock ? "text-rose-500" : lowStock ? "text-amber-500" : "text-emerald-500"}`}
                        >
                          Estoque: {med.stock.current}/{med.stock.min}
                        </span>
                      )}
                      {med.expirationDate && (
                        <span
                          className={`font-bold ${expired ? "text-rose-500" : expiringSoon ? "text-amber-500" : "text-zinc-400"}`}
                        >
                          Vence: {formatDate(med.expirationDate)}
                        </span>
                      )}
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-zinc-600 mt-2 italic">
                        {med.instructions}
                      </p>
                    )}

                    {med.active && todaySlots.length > 0 && (
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        {todaySlots.map((slot) => (
                          <label
                            key={slot.time}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                              slot.taken
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                : isOverdueSlot(slot)
                                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                  : "bg-black border-zinc-700 text-zinc-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={slot.taken}
                              disabled={isPending}
                              onChange={(e) => {
                                startTransition(async () => {
                                  await setDoseTaken(
                                    med.id,
                                    slot.date,
                                    slot.time,
                                    e.target.checked,
                                  );
                                });
                              }}
                              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                            />
                            {slot.time}
                          </label>
                        ))}
                        <span className="text-xs text-zinc-400 font-bold ml-1">
                          {takenToday.length}/{todaySlots.length} hoje
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          await toggleMedicationActive(med.id, !med.active);
                        })
                      }
                      disabled={isPending}
                      className={`p-2 rounded-xl transition-all disabled:opacity-50 ${med.active ? "text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}
                      title={
                        med.active ? "Pausar lembretes" : "Ativar lembretes"
                      }
                    >
                      {med.active ? (
                        <CalendarOff size={18} />
                      ) : (
                        <ShieldCheck size={18} />
                      )}
                    </button>
                    <MedicationFormDialog
                      initialMedication={med}
                      pets={pets}
                      houseMembers={houseMembers}
                    />
                    <button
                      onClick={() => handleDelete(med.id)}
                      disabled={isPending}
                      className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50"
                      title="Excluir medicamento"
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
  );
}
