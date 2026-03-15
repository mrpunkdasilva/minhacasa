"use client";

import { assetsMock } from "@/app/infra/mocks/infrastructure/infrastructure.mock";

export default function AssetsList() {
  const isWarrantyActive = (date?: Date) => {
    if (!date) return true;
    return new Date(date).getTime() > new Date().getTime();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Equipamentos e Ativos</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium">
          Novo Ativo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assetsMock.map((asset) => (
          <div 
            key={asset.id} 
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between hover:border-zinc-700 transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  {asset.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  isWarrantyActive(asset.warrantyUntil) ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                }`}>
                  {isWarrantyActive(asset.warrantyUntil) ? "Em Garantia" : "Sem Garantia"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{asset.name}</h3>
              <p className="text-sm text-zinc-500 mb-4 flex items-center gap-1">
                📍 {asset.location}
              </p>
              {asset.description && (
                <p className="text-xs text-zinc-400 italic mb-4">"{asset.description}"</p>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-auto">
              <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-medium">
                <span>Comprado em</span>
                <span>Garantia até</span>
              </div>
              <div className="flex justify-between text-xs text-white mt-1 font-mono">
                <span>{asset.purchaseDate?.toLocaleDateString("pt-BR") || "N/A"}</span>
                <span className={isWarrantyActive(asset.warrantyUntil) ? "" : "text-rose-500"}>
                  {asset.warrantyUntil?.toLocaleDateString("pt-BR") || "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
