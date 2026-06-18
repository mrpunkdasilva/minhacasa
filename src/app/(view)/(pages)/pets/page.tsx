import PetsView from "@/app/(view)/(pages)/pets/pets.view";
import { getPets } from "@/app/infra/actions/pet.actions";

export default async function PetsPage() {
  const initialPets = await getPets();

  return (
    <main>
      <PetsView initialPets={initialPets} />
    </main>
  );
}
