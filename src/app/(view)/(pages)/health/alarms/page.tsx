import HealthPageHeader from "../components/health-page-header";
import BrowserNotifications from "../components/browser-notifications";
import HealthAlerts from "../components/health-alerts";
import MedicationAlarmList from "../components/medication-alarm-list";
import {
  getAlarmOccurrences,
  getMedicationAlarms,
  getMedications,
  getDoseLogs,
  getAppointments,
} from "@/app/infra/actions/health.actions";

export const metadata = {
  title: "Alarmes de Medicamentos",
  description: "Doses do dia, atrasos e horários dos alarmes de medicamentos.",
};

export default async function HealthAlarmsPage() {
  const alarms = await getMedicationAlarms();
  const safeAlarms = Array.isArray(alarms) ? alarms : [];
  const medications = await getMedications();
  const safeMedications = Array.isArray(medications) ? medications : [];
  const doseLogs = await getDoseLogs(safeMedications.map((med) => med.id));
  const safeLogs = Array.isArray(doseLogs) ? doseLogs : [];
  const appointments = await getAppointments();
  const occurrences = await getAlarmOccurrences();

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <HealthPageHeader
          title="Alarmes"
          description="Doses de hoje, atrasos, estoque, validade e horários configurados."
        />

        <BrowserNotifications
          medications={safeMedications}
          doseLogs={safeLogs}
          alarms={safeAlarms}
          occurrences={occurrences}
        />

        <HealthAlerts
          medications={safeMedications}
          doseLogs={safeLogs}
          appointments={appointments}
          alarms={safeAlarms}
          occurrences={occurrences}
        />

        {safeAlarms.length > 0 && (
          <details className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <summary className="cursor-pointer text-sm font-bold text-zinc-300">
              Regras recorrentes ({safeAlarms.length})
            </summary>
            <div className="pt-6">
              <MedicationAlarmList
                alarms={safeAlarms}
                medications={safeMedications}
              />
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
