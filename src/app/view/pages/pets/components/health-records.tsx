"use client";

import { healthRecordsMock, petsMock } from "@/app/infra/mocks/pets/pets.mock";

export default function HealthRecords() {
  const getPetName = (id: string) =>
    petsMock.find((p) => p.id === id)?.name || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Histórico de Saúde</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-all">
          Nova Registro
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Pet</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Próxima Dose/Visita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {healthRecordsMock.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-white">
                    {getPetName(record.petId)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] bg-zinc-800 text-emerald-400 px-2 py-1 rounded-full font-bold uppercase">
                    {record.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-white">
                      {record.description}
                    </span>
                    {record.vetName && (
                      <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                        Vet: {record.vetName}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-zinc-400 font-mono">
                  {record.date.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4">
                  {record.nextDueDate ? (
                    <span className="text-xs font-bold text-amber-500 font-mono">
                      {record.nextDueDate.toLocaleDateString("pt-BR")}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                      Finalizado
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
