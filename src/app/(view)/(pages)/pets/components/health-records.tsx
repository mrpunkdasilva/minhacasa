"use client";

import { useState, useEffect } from "react";
import { Pet, HealthRecord } from "@/app/domain/entity/pet/pet.entities";
import { HealthRecordType } from "@/app/domain/enums/pets/pet.enums";
import { addHealthRecord, getHealthRecords } from "@/app/infra/actions/pet.actions";

interface HealthRecordsProps {
  pets: Pet[];
}

export default function HealthRecords({ pets }: HealthRecordsProps) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || "");

  useEffect(() => {
    async function loadRecords() {
      const allRecords = await Promise.all(
        pets.map(pet => getHealthRecords(pet.id))
      );
      setRecords(allRecords.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    if (pets.length > 0) loadRecords();
  }, [pets]);

  const getPetName = (id: string) =>
    pets.find((p) => p.id === id)?.name || "Unknown";

  const handleAddRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await addHealthRecord(formData);
      if (result.success) {
        setIsModalOpen(false);
        // Refresh local list
        const updated = await Promise.all(pets.map(pet => getHealthRecords(pet.id)));
        setRecords(updated.flat().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Erro ao processar solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Histórico de Saúde</h2>
        {pets.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-all"
          >
            Novo Registro
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-lg">
          <p className="text-zinc-500">Nenhum registro de saúde encontrado.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 text-zinc-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-nowrap">Pet</th>
                  <th className="px-6 py-4 text-nowrap">Tipo</th>
                  <th className="px-6 py-4 text-nowrap">Descrição</th>
                  <th className="px-6 py-4 text-nowrap">Data</th>
                  <th className="px-6 py-4 text-nowrap">Próxima Dose/Visita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-nowrap">
                      <span className="text-sm font-bold text-white">
                        {getPetName(record.petId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-nowrap">
                      <span className="text-[10px] bg-zinc-800 text-emerald-400 px-2 py-1 rounded-full font-bold uppercase">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-nowrap">
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
                    <td className="px-6 py-4 text-xs text-zinc-400 font-mono text-nowrap">
                      {new Date(record.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-nowrap">
                      {record.nextDueDate ? (
                        <span className="text-xs font-bold text-amber-500 font-mono">
                          {new Date(record.nextDueDate).toLocaleDateString("pt-BR")}
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
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Novo Registro de Saúde</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Pet</label>
                <select 
                  name="petId" 
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Tipo</label>
                  <select name="type" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500">
                    {Object.entries(HealthRecordType).map(([key, value]) => (
                      <option key={key} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Data</label>
                  <input name="date" type="date" required className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Descrição</label>
                <input name="description" required placeholder="Ex: Vacina V10" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Vet (Opcional)</label>
                  <input name="vetName" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Próxima Data (Opcional)</label>
                  <input name="nextDueDate" type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-bold py-3 rounded mt-4 hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Salvando..." : "Adicionar Registro"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
