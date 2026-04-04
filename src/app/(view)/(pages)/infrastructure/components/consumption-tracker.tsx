"use client";

import { utilityReadingsMock } from "@/app/infra/mocks/infrastructure/infrastructure.mock";

export default function ConsumptionTracker() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Consumo de Utilidades</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-all">
          Nova Leitura
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {utilityReadingsMock.map((reading) => (
          <div
            key={reading.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between hover:border-zinc-700 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                {reading.utilityType}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {reading.readingDate.toLocaleDateString("pt-BR")}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold font-mono text-white">
                {reading.value}
              </span>
              <span className="text-sm text-zinc-500">{reading.unit}</span>
            </div>

            <p className="text-[10px] text-zinc-500 uppercase font-medium tracking-tight">
              Última Leitura Registrada
            </p>

            {/* Simple Progress Bar Mock */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
                <span>Progresso Mensal</span>
                <span>65%</span>
              </div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-zinc-500 italic text-sm">
        Gráficos de evolução de consumo (kWh/m³) em desenvolvimento...
      </div>
    </div>
  );
}
