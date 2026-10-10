import HealthPageHeader from "../components/health-page-header";
import HealthAlerts from "../components/health-alerts";
import BrowserNotifications from "../components/browser-notifications";
import {
  getMedications,
  getDoseLogs,
  getAppointments,
} from "@/app/infra/actions/health.actions";

export const metadata = {
  title: "Alertas de Saúde",
  description: "Doses do dia, estoque baixo, validade e consultas em breve.",
};

export default async function HealthAlertsPage() {
  const medications = await getMedications();
  const safeMedications = Array.isArray(medications) ? medications : [];
  const doseLogs = await getDoseLogs(safeMedications.map((med) => med.id));
  const safeLogs = Array.isArray(doseLogs) ? doseLogs : [];
  const appointments = await getAppointments();
  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <HealthPageHeader
          title="Alertas de Saúde"
          description="Doses do dia, estoque, validade e consultas que precisam de atenção."
        />

        <BrowserNotifications
          medications={safeMedications}
          doseLogs={safeLogs}
        />

        <HealthAlerts
          medications={safeMedications}
          doseLogs={safeLogs}
          appointments={safeAppointments}
        />
      </div>
    </div>
  );
}
