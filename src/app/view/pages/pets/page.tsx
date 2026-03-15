import Header from "@/app/view/components/header/header";
import PetsView from "@/app/view/pages/pets/pets.view";

export default function PetsPage() {
  return (
    <main className="bg-black min-h-screen">
      <Header />
      <PetsView />
    </main>
  );
}
