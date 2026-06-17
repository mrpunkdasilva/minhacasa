"use client";

import { WishlistItem } from "@/app/domain/entity/wishlist/wishlist-item.entity";
import { WishlistPriority } from "@/app/domain/enums/wishlist/wishlist-priority";
import { toggleWishlistItemPurchased, deleteWishlistItem } from "@/app/infra/actions/wishlist.actions";
import { useState } from "react";
import EditSavedAmountModal from "./edit-saved-amount-modal";

interface WishlistGridProps {
  items: WishlistItem[];
}

export default function WishlistGrid({ items }: WishlistGridProps) {
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

  const priorityStyles = {
    [WishlistPriority.LOW]: "bg-blue-500/10 text-blue-500",
    [WishlistPriority.MEDIUM]: "bg-zinc-500/10 text-zinc-400",
    [WishlistPriority.HIGH]: "bg-amber-500/10 text-amber-500",
    [WishlistPriority.URGENT]: "bg-rose-500/10 text-rose-500",
  };

  const handleTogglePurchased = async (id: string, isPurchased: boolean) => {
    await toggleWishlistItemPurchased(id, isPurchased);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      await deleteWishlistItem(id);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-lg">
        <p className="text-zinc-500">Nenhum item na sua lista de desejos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const progress = Math.min(
          (item.savedAmount.amount / item.price.amount) * 100,
          100,
        );

        return (
          <div
            key={item.id}
            className={`bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group ${
              item.isPurchased ? "opacity-60" : ""
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  {item.category}
                </span>
                <div className="flex gap-2">
                   <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${priorityStyles[item.priority]}`}
                  >
                    {item.priority}
                  </span>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-zinc-600 hover:text-rose-500 transition-colors"
                    aria-label="Excluir item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                {item.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-xl font-bold font-mono text-white">
                  {item.price.amount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                  <span className="text-zinc-500">Progresso</span>
                  <span className="text-emerald-500">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${item.isPurchased ? "bg-emerald-500" : "bg-emerald-500/60"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex flex-col gap-2 text-[10px] font-mono text-zinc-500">
                  <div className="flex justify-between items-center w-full">
                    <span className="uppercase font-bold tracking-tighter">Guardado:</span>
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="flex items-center gap-1 text-white hover:text-emerald-400 transition-colors bg-zinc-800/50 px-2 py-1 rounded"
                      title="Clique para editar valor guardado"
                    >
                      {item.savedAmount.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                  </div>
                  <div className="flex justify-between w-full border-t border-zinc-800 pt-1">
                    <span className="uppercase font-bold tracking-tighter">Falta:</span>
                    <span className="text-zinc-400 font-bold">
                      {Math.max(0, item.price.amount - item.savedAmount.amount).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs bg-zinc-800 text-white py-2 rounded hover:bg-zinc-700 transition-colors"
                  >
                    Ver na Loja ↗
                  </a>
                )}
                <button
                  onClick={() => handleTogglePurchased(item.id, !item.isPurchased)}
                  className={`flex-1 text-xs py-2 rounded font-bold transition-colors ${
                    item.isPurchased 
                      ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30" 
                      : "bg-emerald-500 text-black hover:bg-emerald-400"
                  }`}
                >
                  {item.isPurchased ? "Reabrir" : "Marcar como Comprado"}
                </button>
              </div>

              {item.isPurchased && (
                <div className="text-center text-[10px] text-emerald-500 font-bold uppercase tracking-widest pt-2">
                  ✓ Adquirido
                </div>
              )}
            </div>
          </div>
        );
      })}

      {selectedItem && (
        <EditSavedAmountModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}
