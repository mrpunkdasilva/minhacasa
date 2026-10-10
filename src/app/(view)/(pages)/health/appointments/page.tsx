import HealthPageHeader from "../components/health-page-header";
import Appointments from "../components/appointments";
import { getAppointments } from "@/app/infra/actions/health.actions";

export const metadata = {
  title: "Agenda de Saúde",
  description: "Consultas, exames e compromissos de saúde da casa.",
};

export default async function HealthAppointmentsPage() {
  const appointments = await getAppointments();
  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <HealthPageHeader
          title="Agenda de Saúde"
          description="Consultas, exames e retornos com aviso antecipado."
        />

        <Appointments appointments={safeAppointments} />
      </div>
    </div>
  );
}
