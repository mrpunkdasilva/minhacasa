"use client";

import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import { Trash2, Plus, Minus, AlertTriangle, Calendar } from "lucide-react";
import { deleteMarketItem, updateMarketItemQuantity } from "@/app/infra/actions/market.actions";
import { useTransition } from "react";
import AddMarketItemDialog from "./AddMarketItemDialog";
import EditMarketItemDialog from "./EditMarketItemDialog";

interface InventoryProps {
  initialItems?: MarketItem[];
}

export default function Inventory({ initialItems = [] }: InventoryProps) {
  const [isPending, startTransition] = useTransition();

  const safeItems = Array.isArray(initialItems) ? initialItems : [];

  const isExpiringSoon = (date: Date | undefined) => {
    if (!date) return false;
    const today = new Date();
    const expiry = new Date(date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  const handleQuantityChange = async (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    startTransition(async () => {
      await updateMarketItemQuantity(id, newQty);
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja remover este item do estoque?")) {
      startTransition(async () => {
        await deleteMarketItem(id);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Minha Despensa</h2>
          <p className="text-xs text-zinc-500 mt-1">Gerencie o que você tem guardado em casa.</p>
        </div>
        <AddMarketItemDialog />
      </div>

      {safeItems.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <p className="text-zinc-500 font-medium">Seu estoque está vazio. Itens comprados na lista aparecerão aqui!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeItems.map((item) => {
            const isLowStock = item.minimumQuantity !== undefined && item.quantity <= item.minimumQuantity;
            const stockLevel = item.minimumQuantity ? Math.min(100, (item.quantity / (item.minimumQuantity * 2)) * 100) : 100;

            return (
              <div
                key={item.id}
                className={`group relative bg-zinc-900 border transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between overflow-hidden ${
                  isLowStock 
                    ? "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Background low stock indicator */}
                {isLowStock && (
                  <div className="absolute top-0 right-0 p-2">
                    <AlertTriangle className="text-amber-500 opacity-50" size={16} />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`font-bold tracking-tight ${isLowStock ? "text-amber-500" : "text-white"} text-lg leading-tight`}>
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest bg-black/40 px-2 py-0.5 rounded mt-1 inline-block">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EditMarketItemDialog item={item} />
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="p-1.5 text-zinc-700 hover:text-rose-500 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-xl p-3 mb-4 flex items-center justify-between border border-zinc-800/50">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      disabled={isPending || item.quantity <= 0}
                      className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    
                    <div className="text-center">
                      <span className="block text-lg font-black text-white leading-none">
                        {item.quantity}
                      </span>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold">
                        {item.unit.split(" ")[0]}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      disabled={isPending}
                      className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                      <span className={isLowStock ? "text-amber-500" : "text-zinc-500"}>
                        {isLowStock ? "Estoque Crítico" : "Nível de Estoque"}
                      </span>
                      <span className="text-zinc-400">Min: {item.minimumQuantity || 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLowStock ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-emerald-500"
                        }`}
                        style={{ width: `${stockLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {item.expirationDate && (
                  <div className={`flex items-center gap-2 pt-3 border-t border-zinc-800/50 ${
                    isExpiringSoon(item.expirationDate) ? "text-amber-500" : "text-zinc-500"
                  }`}>
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Val: {new Date(item.expirationDate).toLocaleDateString("pt-BR")}
                      {isExpiringSoon(item.expirationDate) && " (Vencendo!)"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
