"use client";

import { useState, useTransition } from "react";
import { HealthAppointment } from "@/app/domain/entity/health/health.entities";
import {
  deleteAppointment,
  toggleAppointmentCompleted,
} from "@/app/infra/actions/health.actions";
import { Trash2, CalendarCheck, MapPin, User, BellRing } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Calendar } from "@/app/(view)/components/ui/calendar";
import AppointmentFormDialog from "./appointment-form-dialog";
import { daysUntil, formatDate, formatTime, toDateKey } from "./health-utils";
import { ConfirmDialog } from "./feedback-dialogs";

interface AppointmentsProps {
  appointments: HealthAppointment[];
}

export default function Appointments({ appointments }: AppointmentsProps) {
  const [isPending, startTransition] = useTransition();
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    () => new Date(),
  );

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const sorted = [...safeAppointments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const appointmentDates = new Set(
    sorted.map((item) => toDateKey(new Date(item.date))),
  );
  const selectedKey = toDateKey(selectedDate ?? new Date());
  const selectedDayAppointments = sorted.filter(
    (item) => toDateKey(new Date(item.date)) === selectedKey,
  );

  const upcoming = sorted.filter(
    (item) => !item.completed && daysUntil(item.date) >= 0,
  );
  const needsReminder = upcoming.filter(
    (item) => daysUntil(item.date) <= item.reminderDaysBefore,
  );
  const rest = sorted.filter((item) => !needsReminder.includes(item));

  const handleDelete = () => {
    if (!appointmentToDelete) return;
    startTransition(async () => {
      await deleteAppointment(appointmentToDelete);
      setAppointmentToDelete(null);
    });
  };

  const renderCard = (item: HealthAppointment) => {
    const days = daysUntil(item.date);
    const isToday = days === 0;
    const isUpcoming = !item.completed && days >= 0;
    const needsAlert = isUpcoming && days <= item.reminderDaysBefore;

    return (
      <div
        key={item.id}
        className={`p-5 rounded-xl border transition-all group ${
          item.completed
            ? "bg-zinc-900/30 border-zinc-900/50 opacity-50"
            : needsAlert
              ? "bg-amber-500/5 border-amber-500/30"
              : "bg-zinc-900 border-zinc-800 hover:border-emerald-500/30"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black uppercase tracking-tighter">
                {item.type}
              </span>
              {isToday && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black uppercase tracking-tighter">
                  Hoje
                </span>
              )}
              {needsAlert && !isToday && (
                <span className="flex items-center gap-1 text-[9px] text-amber-500 font-black uppercase">
                  <BellRing size={10} /> Em {days} {days === 1 ? "dia" : "dias"}
                </span>
              )}
            </div>
            <h3 className="font-bold text-white text-lg tracking-tight mt-2">
              {item.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-zinc-500">
              <span className="font-mono">
                📅 {formatDate(item.date)} às {formatTime(item.date)}
              </span>
              {item.doctorName && (
                <span className="flex items-center gap-1">
                  <User size={12} /> {item.doctorName}
                </span>
              )}
              {item.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {item.location}
                </span>
              )}
            </div>
            {item.notes && (
              <p className="text-xs text-zinc-600 mt-2 italic">{item.notes}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                startTransition(async () => {
                  await toggleAppointmentCompleted(item.id, !item.completed);
                })
              }
              disabled={isPending}
              className="p-2 text-zinc-600 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-50"
              title={item.completed ? "Marcar como pendente" : "Concluído"}
            >
              <CalendarCheck size={18} />
            </button>
            <AppointmentFormDialog initialAppointment={item} />
            <button
              onClick={() => setAppointmentToDelete(item.id)}
              disabled={isPending}
              className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50"
              title="Excluir compromisso"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-xs text-zinc-500">
            {upcoming.length} próximo(s) · {safeAppointments.length} no total
          </p>
          <AppointmentFormDialog />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date ?? undefined)}
              modifiers={{
                hasAppointment: (date) => appointmentDates.has(toDateKey(date)),
              }}
              modifiersClassNames={{
                hasAppointment:
                  "bg-emerald-500/10 text-emerald-300 [&_button]:text-emerald-300",
              }}
            />
            <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-500">
              <span className="size-2 rounded-full bg-emerald-500" />
              Dias com consultas agendadas
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h3 className="font-bold text-white">
              {selectedDate ? formatDate(selectedDate) : "Selecione uma data"}
            </h3>
            {selectedDayAppointments.length > 0 ? (
              <div className="mt-4 space-y-2">
                {selectedDayAppointments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-black/20 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {formatTime(item.date)} · {item.type}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-tighter ${
                        item.completed ? "text-zinc-500" : "text-emerald-500"
                      }`}
                    >
                      {item.completed ? "Concluído" : "Agendado"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 text-center">
                <CalendarCheck className="mb-2 text-zinc-700" size={28} />
                <p className="text-xs text-zinc-500">
                  Nenhuma consulta nesta data.
                </p>
              </div>
            )}
          </div>
        </div>

        {needsReminder.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {needsReminder.map(renderCard)}
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map(renderCard)}
          </div>
        )}

        {sorted.length === 0 && (
          <div className="p-10 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <CalendarCheck className="mx-auto text-zinc-700 mb-4" size={40} />
            <p className="text-zinc-500 font-medium">
              Nenhum compromisso de saúde agendado.
            </p>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(appointmentToDelete)}
        onOpenChange={(isOpen) => !isOpen && setAppointmentToDelete(null)}
        title="Excluir compromisso?"
        description="Este compromisso será removido da agenda."
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
