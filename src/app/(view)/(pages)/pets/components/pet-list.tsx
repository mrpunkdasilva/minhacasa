"use client";

import { useState } from "react";
import { Pet } from "@/app/domain/entity/pet/pet.entities";
import { PetType, PetGender } from "@/app/domain/enums/pets/pet.enums";
import { addPet, deletePet } from "@/app/infra/actions/pet.actions";

interface PetListProps {
  initialPets: Pet[];
}

export default function PetList({ initialPets }: PetListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const handleAddPet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await addPet(formData);
      if (result.success) {
        setIsModalOpen(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Erro ao processar solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePet = async (id: string) => {
    if (confirm("Deseja remover este pet?")) {
      await deletePet(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Seus Pets</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-all"
        >
          Adicionar Pet
        </button>
      </div>

      {initialPets.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-500">Você ainda não cadastrou nenhum pet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex gap-6 items-center hover:border-zinc-700 transition-all group relative"
            >
              <button 
                onClick={() => handleDeletePet(pet.id)}
                className="absolute top-4 right-4 text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Excluir pet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>

              <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-3xl shrink-0">
                {pet.type === PetType.DOG ? "🐶" : pet.type === PetType.CAT ? "🐱" : pet.type === PetType.BIRD ? "🐦" : "🐾"}
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
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
                      Idade
                    </span>
                    <span className="text-sm text-white font-medium">
                      {calculateAge(pet.birthDate)} anos
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
                      Peso
                    </span>
                    <span className="text-sm text-white font-medium">
                      {pet.weight.value} {pet.weight.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Novo Pet</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddPet} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Nome</label>
                <input name="name" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Tipo</label>
                  <select name="type" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500">
                    {Object.entries(PetType).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Gênero</label>
                  <select name="gender" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500">
                    {Object.entries(PetGender).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Raça</label>
                <input name="breed" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Data de Nascimento</label>
                <input name="birthDate" type="date" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Peso</label>
                  <input name="weight" type="number" step="0.1" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Unidade</label>
                  <select name="weightUnit" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-3 rounded mt-4 hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Salvando..." : "Salvar Pet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
