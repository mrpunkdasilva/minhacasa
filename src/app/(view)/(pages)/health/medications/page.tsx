import HealthPageHeader from "../components/health-page-header";
import MedicationList from "../components/medication-list";
import {
  getMedications,
  getDoseLogs,
} from "@/app/infra/actions/health.actions";
import { getPets } from "@/app/infra/actions/pet.actions";
import { getHouseMembers } from "@/app/infra/actions/house.actions";

export const metadata = {
  title: "Medicamentos",
  description: "Gerencie os medicamentos da casa e seus horários.",
};

export default async function HealthMedicationsPage() {
  const medications = await getMedications();
  const safeMedications = Array.isArray(medications) ? medications : [];
  const doseLogs = await getDoseLogs(safeMedications.map((med) => med.id));
  const safeLogs = Array.isArray(doseLogs) ? doseLogs : [];
  const pets = (await getPets()).map((pet) => ({ id: pet.id, name: pet.name }));
  const houseMembers = (await getHouseMembers()).map((member) => ({
    id: member.id,
    name: member.name,
  }));

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <HealthPageHeader
          title="Medicamentos"
          description="Cadastro, horários das doses, estoque e validade."
        />

        <MedicationList
          medications={safeMedications}
          doseLogs={safeLogs}
          pets={pets}
          houseMembers={houseMembers}
        />
      </div>
    </div>
  );
}
