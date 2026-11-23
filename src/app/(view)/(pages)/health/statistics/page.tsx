import HealthPageHeader from "../components/health-page-header";
import HealthStatistics from "../components/health-statistics";
import {
  getAlarmOccurrences,
  getAppointments,
  getDoseLogs,
  getMedicationAlarms,
  getMedications,
} from "@/app/infra/actions/health.actions";
import { getHouseMembers } from "@/app/infra/actions/house.actions";

export const metadata = {
  title: "Estatísticas de Saúde",
  description: "Indicadores de medicamentos, doses, alarmes e consultas.",
};

export default async function HealthStatisticsPage() {
  const [medications, alarms, occurrences, appointments, houseMembers] =
    await Promise.all([
      getMedications(),
      getMedicationAlarms(),
      getAlarmOccurrences(),
      getAppointments(),
      getHouseMembers(),
    ]);
  const safeMedications = Array.isArray(medications) ? medications : [];
  const doseLogs = await getDoseLogs(safeMedications.map((med) => med.id));

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="flex flex-col gap-8">
        <HealthPageHeader
          title="Estatísticas de Saúde"
          description="Um resumo do cuidado com medicamentos, alarmes e compromissos."
        />

        <HealthStatistics
          medications={safeMedications}
          alarms={Array.isArray(alarms) ? alarms : []}
          occurrences={Array.isArray(occurrences) ? occurrences : []}
          doseLogs={Array.isArray(doseLogs) ? doseLogs : []}
          appointments={Array.isArray(appointments) ? appointments : []}
          houseMembers={(Array.isArray(houseMembers) ? houseMembers : []).map(
            ({ id, name }) => ({ id, name }),
          )}
          now={new Date().toISOString()}
        />
      </div>
    </div>
  );
}
