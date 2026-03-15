"use client";

import { systemComponentsMock } from "@/app/infra/mocks/infrastructure/infrastructure.mock";

export default function SystemsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sistemas e Configurações Core</h2>
        <button className="bg-zinc-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-all">
          Gerenciar Sistemas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemComponentsMock.map((system) => (
          <div 
            key={system.id} 
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all relative overflow-hidden group"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800/20 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
            
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2 block">
              {system.systemType}
            </span>
            <h3 className="text-lg font-bold text-white mb-1">{system.name}</h3>
            <p className="text-sm text-zinc-500 mb-6 flex items-center gap-1">
              📍 {system.location}
            </p>

            <div className="bg-black/40 border border-zinc-800 rounded p-3 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Detalhes Técnicos</span>
              <span className="text-sm text-zinc-300 font-mono break-all">{system.details}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Contacts Placeholder */}
      <div className="mt-12 p-8 bg-rose-950/20 border border-rose-500/20 rounded-lg">
        <h4 className="text-rose-500 font-bold uppercase text-xs tracking-widest mb-4">Contatos de Emergência</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-sm">
            <p className="text-zinc-400">Eletricista</p>
            <p className="text-white font-bold">(11) 99999-0000</p>
          </div>
          <div className="text-sm">
            <p className="text-zinc-400">Encanador</p>
            <p className="text-white font-bold">(11) 98888-0000</p>
          </div>
          <div className="text-sm">
            <p className="text-zinc-400">Provedor de Internet</p>
            <p className="text-white font-bold">0800 123 4567</p>
          </div>
        </div>
      </div>
    </div>
  );
}
