"use client";

import { useTransition } from "react";
import { HealthAppointment } from "@/app/domain/entity/health/health.entities";
import {
  deleteAppointment,
  toggleAppointmentCompleted,
} from "@/app/infra/actions/health.actions";
import { Trash2, CalendarCheck, MapPin, User, BellRing } from "lucide-react";
import AppointmentFormDialog from "./appointment-form-dialog";
import { daysUntil, formatDate, formatTime } from "./health-utils";

interface AppointmentsProps {
  appointments: HealthAppointment[];
}

export default function Appointments({ appointments }: AppointmentsProps) {
  const [isPending, startTransition] = useTransition();

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const sorted = [...safeAppointments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const upcoming = sorted.filter(
    (item) => !item.completed && daysUntil(item.date) >= 0,
  );
  const needsReminder = upcoming.filter(
    (item) => daysUntil(item.date) <= item.reminderDaysBefore,
  );
  const rest = sorted.filter((item) => !needsReminder.includes(item));

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este compromisso?")) {
      startTransition(async () => {
        await deleteAppointment(id);
      });
    }
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
              onClick={() => handleDelete(item.id)}
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

  if (sorted.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <AppointmentFormDialog />
        </div>
        <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <CalendarCheck className="mx-auto text-zinc-700 mb-4" size={48} />
          <p className="text-zinc-500 font-medium">
            Nenhum compromisso de saúde agendado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-xs text-zinc-500">
          {upcoming.length} próximo(s) · {safeAppointments.length} no total
        </p>
        <AppointmentFormDialog />
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
    </div>
  );
}
