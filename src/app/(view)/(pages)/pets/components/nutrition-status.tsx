"use client";

import { petNutritionMock, petsMock } from "@/app/infra/mocks/pets/pets.mock";

export default function NutritionStatus() {
  const getPetName = (id: string) =>
    petsMock.find((p) => p.id === id)?.name || "Unknown";

  const calculateDaysRemaining = (stock: number, dailyAmount: number) => {
    return Math.floor((stock * 1000) / dailyAmount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Estoque de Alimentação</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {petNutritionMock.map((item) => {
          const progress = (item.stock.current / item.stock.max) * 100;
          const daysLeft = calculateDaysRemaining(
            item.stock.current,
            item.stock.dailyAmount,
          );

          return (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all"
            >
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
    </div>
  );
}
