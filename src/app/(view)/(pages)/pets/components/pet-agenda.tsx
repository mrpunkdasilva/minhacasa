"use client";

import { petServicesMock, petsMock } from "@/app/infra/mocks/pets/pets.mock";

export default function PetAgenda() {
  const getPetName = (id: string) =>
    petsMock.find((p) => p.id === id)?.name || "Unknown";

  const isToday = (someDate: Date) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Agenda de Serviços</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 transition-all">
          Agendar Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {petServicesMock.map((service) => (
          <div
            key={service.id}
            className={`bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative overflow-hidden group hover:border-zinc-700 transition-all ${
              isToday(service.date) ? "ring-1 ring-emerald-500/50" : ""
            }`}
          >
            {isToday(service.date) && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 uppercase tracking-tighter rounded-bl">
                Hoje
              </div>
            )}

            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2 block">
              {service.serviceType}
            </span>
            <h3 className="text-xl font-bold text-white mb-1">
              {getPetName(service.petId)}
            </h3>
            <p className="text-sm text-zinc-500 mb-6 flex items-center gap-1 font-mono uppercase">
              📅 {service.date.toLocaleDateString("pt-BR")}
            </p>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Local</span>
                <span className="text-white font-medium">
                  {service.location}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Valor</span>
                <span className="text-white font-bold font-mono">
                  {service.price.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
