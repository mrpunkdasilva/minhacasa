"use client";

import { useEffect, useRef, useState } from "react";
import {
  Medication,
  DoseLog,
} from "@/app/domain/entity/health/health.entities";
import { Bell, X } from "lucide-react";
import {
  getTodayDoseSlots,
  isOverdueSlot,
  toDateKey,
  nowTime,
} from "./health-utils";

interface BrowserNotificationsProps {
  medications: Medication[];
  doseLogs: DoseLog[];
}

const NOTIFY_WINDOW_MS = 60_000;

export default function BrowserNotifications({
  medications,
  doseLogs,
}: BrowserNotificationsProps) {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : null,
  );
  const [dismissed, setDismissed] = useState(false);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (permission !== "granted") return;

    const notify = (title: string, body: string) => {
      try {
        new Notification(title, { body, icon: "/icon.png" });
      } catch {
        // Notification constructor can throw in some browsers; ignore.
      }
    };

    const check = () => {
      const date = toDateKey(new Date());
      const slots = getTodayDoseSlots(medications, doseLogs);

      slots.forEach((slot) => {
        const key = `${slot.med.id}|${date}|${slot.time}`;
        if (slot.taken || firedRef.current.has(key)) return;

        const overdue = isOverdueSlot(slot);
        const dueNow = !overdue && slot.time === nowTime();
        if (!overdue && !dueNow) return;

        firedRef.current.add(key);
        notify(
          overdue ? "Dose atrasada!" : "Hora do medicamento",
          `${slot.med.name} · ${slot.med.dosage} ${slot.med.dosageUnit} · ${slot.time}${
            slot.med.subjectName ? ` · ${slot.med.subjectName}` : ""
          }`,
        );
      });
    };

    check();
    const interval = setInterval(check, NOTIFY_WINDOW_MS);
    return () => clearInterval(interval);
  }, [permission, medications, doseLogs]);

  const enable = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (permission === null) return null;
  if (permission === "granted" || permission === "denied" || dismissed)
    return null;

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-amber-500/10 text-amber-500">
          <Bell size={16} />
        </span>
        <p className="text-xs text-zinc-400 min-w-0">
          Ative as notificações do navegador para ser avisado nos horários das
          doses.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={enable}
          className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-black px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Ativar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-zinc-600 hover:text-white transition-colors"
          aria-label="Dispensar aviso de notificações"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
