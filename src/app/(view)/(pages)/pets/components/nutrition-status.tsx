"use client";

import { useState, useEffect } from "react";
import { Pet, PetNutrition } from "@/app/domain/entity/pet/pet.entities";
import { getPetNutrition, updatePetNutrition } from "@/app/infra/actions/pet.actions";

interface NutritionStatusProps {
  pets: Pet[];
}

export default function NutritionStatus({ pets }: NutritionStatusProps) {
  const [nutritionData, setNutritionStatus] = useState<PetNutrition[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadNutrition() {
      const data = await Promise.all(
        pets.map(pet => getPetNutrition(pet.id))
      );
      setNutritionStatus(data.filter((n): n is PetNutrition => n !== null));
    }
    if (pets.length > 0) loadNutrition();
  }, [pets]);

  const getPetName = (id: string) =>
    pets.find((p) => p.id === id)?.name || "Unknown";

  const calculateDaysRemaining = (stock: number, dailyAmount: number) => {
    if (!dailyAmount) return 0;
    return Math.floor((stock * 1000) / dailyAmount);
  };

  const handleUpdateStock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPetId) return;
    
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      foodName: formData.get("foodName") as string,
      stock: {
        current: parseFloat(formData.get("current") as string),
        max: parseFloat(formData.get("max") as string),
        dailyAmount: parseFloat(formData.get("dailyAmount") as string),
      }
    };

    try {
      const result = await updatePetNutrition(selectedPetId, data);
      if (result.success) {
        setSelectedPetId(null);
        // Refresh
        const updated = await Promise.all(pets.map(pet => getPetNutrition(pet.id)));
        setNutritionStatus(updated.filter((n): n is PetNutrition => n !== null));
      }
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-white">
        <h2 className="text-xl font-semibold">Estoque de Alimentação</h2>
        {pets.length > 0 && (
          <button 
            onClick={() => setSelectedPetId(pets[0].id)}
            className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-all"
          >
            Gerenciar Estoque
          </button>
        )}
      </div>

      {nutritionData.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-500">Nenhum estoque cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nutritionData.map((item) => {
            const progress = (item.stock.current / item.stock.max) * 100;
            const daysLeft = calculateDaysRemaining(
              item.stock.current,
              item.stock.dailyAmount,
            );

            return (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all group relative"
              >
                 <button 
                  onClick={() => setSelectedPetId(item.petId)}
                  className="absolute top-4 right-4 text-zinc-600 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Editar estoque"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {item.foodName}
                    </h3>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                      Pet: {getPetName(item.petId)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-emerald-500">
                      {item.stock.current}kg
                    </span>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                      Total: {item.stock.max}kg
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-zinc-500">
                      <span>Nível de Estoque</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${progress < 20 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-md text-center border ${
                      daysLeft < 7
                        ? "bg-rose-500/10 border-rose-500/30"
                        : "bg-zinc-800/50 border-zinc-800"
                    }`}
                  >
                    <p
                      className={`text-xs font-medium uppercase tracking-widest ${daysLeft < 7 ? "text-rose-500" : "text-zinc-400"}`}
                    >
                      Duração Estimada:{" "}
                      <span className="font-bold text-white">
                        {daysLeft} dias
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedPetId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Gerenciar Estoque</h2>
              <button onClick={() => setSelectedPetId(null)} className="text-zinc-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Pet</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                >
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Nome da Ração/Alimento</label>
                <input name="foodName" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Estoque Atual (kg)</label>
                  <input name="current" type="number" step="0.1" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Capacidade Máx (kg)</label>
                  <input name="max" type="number" step="0.1" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Consumo Diário (gramas)</label>
                <input name="dailyAmount" type="number" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white" />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-3 rounded mt-4 hover:bg-zinc-200 transition-colors"
              >
                {isLoading ? "Salvando..." : "Salvar Estoque"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
