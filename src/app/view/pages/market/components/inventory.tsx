"use client";

import { inventoryMock } from "@/app/infra/mocks/market/market.mock";

export default function Inventory() {
  const isExpiringSoon = (date: Date) => {
    const today = new Date();
    const expiry = new Date(date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Minha Despensa</h2>
        <button className="bg-zinc-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-700 transition-all">
          Gerenciar Estoque
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventoryMock.map((item) => (
          <div 
            key={item.id} 
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <span className="text-xs text-zinc-500">{item.category}</span>
              </div>
              <span className="bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 rounded">
                {item.quantity} {item.unit}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isExpiringSoon(item.expirationDate!) ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: '80%' }} // Mocked stock level
                />
              </div>
              <span className="text-[10px] text-zinc-500">80%</span>
            </div>

            {item.expirationDate && (
              <p className={`text-[10px] mt-4 font-medium uppercase tracking-wider ${
                isExpiringSoon(item.expirationDate) ? "text-amber-500" : "text-zinc-500"
              }`}>
                Validade: {new Date(item.expirationDate).toLocaleDateString("pt-BR")}
                {isExpiringSoon(item.expirationDate) && " (Vencendo logo!)"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
