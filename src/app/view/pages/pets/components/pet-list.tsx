"use client";

import { petsMock } from "@/app/infra/mocks/pets/pets.mock";

export default function PetList() {
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Seus Pets</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-all">
          Adicionar Pet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {petsMock.map((pet) => (
          <div 
            key={pet.id} 
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex gap-6 items-center hover:border-zinc-700 transition-all"
          >
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-3xl shrink-0">
              {pet.type === "Cachorro" ? "🐶" : "🐱"}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold text-white">{pet.name}</h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  {pet.gender}
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-4">{pet.breed}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Idade</span>
                  <span className="text-sm text-white font-medium">{calculateAge(pet.birthDate)} anos</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Peso</span>
                  <span className="text-sm text-white font-medium">{pet.weight} kg</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
