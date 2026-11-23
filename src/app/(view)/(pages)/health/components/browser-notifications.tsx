"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Medication,
  MedicationAlarm,
  MedicationAlarmOccurrence,
  DoseLog,
} from "@/app/domain/entity/health/health.entities";
import { BellRing, Volume2, VolumeX, X } from "lucide-react";
import {
  getTodayDoseSlots,
  isOverdueSlot,
  toDateKey,
  nowTime,
} from "./health-utils";

interface BrowserNotificationsProps {
  medications: Medication[];
  doseLogs: DoseLog[];
  alarms?: MedicationAlarm[];
  occurrences?: MedicationAlarmOccurrence[];
}

const NOTIFY_WINDOW_MS = 60_000;
const SOUND_STORAGE_KEY = "minhacasa.health.alarm.sound";

type AudioContextConstructor = typeof AudioContext;

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (
      window as unknown as {
        webkitAudioContext?: AudioContextConstructor;
      }
    ).webkitAudioContext
  );
}

const noopSubscribe = () => () => {};

const permissionListeners = new Set<() => void>();

function subscribePermission(listener: () => void) {
  permissionListeners.add(listener);
  return () => {
    permissionListeners.delete(listener);
  };
}

function getPermissionSnapshot(): NotificationPermission | null {
  return typeof window !== "undefined" && "Notification" in window
    ? Notification.permission
    : null;
}

function notifyPermissionChange() {
  permissionListeners.forEach((listener) => listener());
}

const soundListeners = new Set<() => void>();

function subscribeSound(listener: () => void) {
  soundListeners.add(listener);
  return () => {
    soundListeners.delete(listener);
  };
}

function getSoundSnapshot() {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem(SOUND_STORAGE_KEY) === "true"
  );
}

function getAudioSupportedSnapshot() {
  return Boolean(getAudioContextConstructor());
}

function setStoredSound(enabled: boolean) {
  window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  soundListeners.forEach((listener) => listener());
}

export default function BrowserNotifications({
  medications,
  doseLogs,
  alarms = [],
  occurrences,
}: BrowserNotificationsProps) {
  const permission = useSyncExternalStore(
    subscribePermission,
    getPermissionSnapshot,
    () => null,
  );
  const audioSupported = useSyncExternalStore(
    noopSubscribe,
    getAudioSupportedSnapshot,
    () => false,
  );
  const soundEnabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    () => false,
  );
  const [dismissed, setDismissed] = useState(false);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      void audioContextRef.current?.close();
    },
    [],
  );

  const unlockAudio = useCallback(async () => {
    const AudioContextClass = getAudioContextConstructor();
    if (!AudioContextClass) return false;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current.state === "running";
  }, []);

  const playAlarmSound = useCallback(async () => {
    const unlocked = await unlockAudio();
    if (!unlocked) return false;

    const context = audioContextRef.current;
    if (!context) return false;

    const start = context.currentTime;
    [0, 0.3, 0.6].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = index === 2 ? 1174.66 : 880;
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(0.9, start + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + 0.24);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
    return true;
  }, [unlockAudio]);

  useEffect(() => {
    if (!soundEnabled || audioContextRef.current?.state === "running") return;

    const unlock = () => {
      void unlockAudio();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [soundEnabled, unlockAudio]);

  const vibrate = useCallback(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const updateSound = useCallback((enabled: boolean) => {
    setStoredSound(enabled);
  }, []);

  useEffect(() => {
    if (permission !== "granted" && !soundEnabled) return;

    const check = () => {
      const date = toDateKey(new Date());
      const slots = getTodayDoseSlots(
        medications,
        doseLogs,
        alarms,
        occurrences,
      );

      slots.forEach((slot) => {
        const key = `${slot.med.id}|${date}|${slot.time}`;
        if (slot.taken || firedRef.current.has(key)) return;

        const overdue = isOverdueSlot(slot);
        const dueNow = !overdue && slot.time === nowTime();
        if (!overdue && !dueNow) return;

        firedRef.current.add(key);

        if (permission === "granted") {
          try {
            new Notification(
              overdue ? "Dose atrasada!" : "Hora do medicamento",
              {
                body: `${slot.med.name} · ${slot.med.dosage} ${slot.med.dosageUnit} · ${slot.time}${
                  slot.med.subjectName ? ` · ${slot.med.subjectName}` : ""
                }${slot.alarm?.note ? ` · ${slot.alarm.note}` : ""}`,
                icon: "/icon.png",
                tag: key,
                requireInteraction: true,
                silent: false,
              },
            );
          } catch {}
        }

        if (soundEnabled) {
          void playAlarmSound();
          vibrate();
        }
      });
    };

    check();
    const interval = setInterval(check, NOTIFY_WINDOW_MS);
    return () => clearInterval(interval);
  }, [
    permission,
    soundEnabled,
    medications,
    doseLogs,
    alarms,
    occurrences,
    playAlarmSound,
    vibrate,
  ]);

  const showAudioMessage = (message: string) => {
    setAudioMessage(message);
    window.setTimeout(() => setAudioMessage(null), 3000);
  };

  const enable = async () => {
    const unlocked = await unlockAudio();
    updateSound(unlocked);
    if (unlocked) {
      void playAlarmSound();
      showAudioMessage("Som ativado.");
    } else {
      showAudioMessage("O navegador bloqueou o áudio.");
    }

    if ("Notification" in window) {
      await Notification.requestPermission();
      notifyPermissionChange();
    }
  };

  const testSound = async () => {
    const played = await playAlarmSound();
    vibrate();
    showAudioMessage(
      played ? "Som testado." : "Clique em “Com som” para liberar o áudio.",
    );
  };

  if (permission === null && !audioSupported) return null;

  const showPrompt = permission === "default" && !dismissed;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
          <BellRing size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-zinc-200">
            {showPrompt
              ? "Ative os avisos de medicamento"
              : permission === "denied"
                ? "Notificações bloqueadas"
                : "Avisos de medicamento"}
          </p>
          <p className="text-[11px] text-zinc-500">
            {showPrompt
              ? "Você receberá notificação e um som quando a dose chegar."
              : `Notificações ${
                  permission === "granted" ? "ativas" : "indisponíveis"
                } · som ${soundEnabled ? "ativo" : "desligado"}`}
          </p>
          {audioMessage && (
            <p className="mt-1 text-[10px] text-emerald-400">{audioMessage}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {showPrompt && (
          <>
            <button
              onClick={enable}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black transition-colors hover:bg-emerald-600"
            >
              Ativar
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-zinc-600 transition-colors hover:text-white"
              aria-label="Dispensar aviso de notificações"
            >
              <X size={14} />
            </button>
          </>
        )}

        {!showPrompt && (
          <>
            <button
              onClick={testSound}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
            >
              Testar som
            </button>
            <button
              onClick={() => {
                if (soundEnabled) {
                  updateSound(false);
                } else {
                  void unlockAudio().then(updateSound);
                }
              }}
              className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
              title={soundEnabled ? "Desativar som" : "Ativar som"}
            >
              {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              {soundEnabled ? "Sem som" : "Com som"}
            </button>
          </>
        )}

        {permission === "default" && dismissed && (
          <button
            onClick={() => setDismissed(false)}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
          >
            Ativar avisos
          </button>
        )}
      </div>
    </div>
  );
}
