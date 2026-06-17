"use client";

import { useState } from "react";
import { WishlistItem } from "@/app/domain/entity/wishlist/wishlist-item.entity";
import { updateWishlistSavedAmount } from "@/app/infra/actions/wishlist.actions";

interface EditSavedAmountModalProps {
  item: WishlistItem;
  onClose: () => void;
}

export default function EditSavedAmountModal({ item, onClose }: EditSavedAmountModalProps) {
  // Inicializa como vazio se for zero para não mostrar o "0" chato
  const [amount, setAmount] = useState<string>(
    item.savedAmount.amount === 0 ? "" : item.savedAmount.amount.toString()
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Converte para número, tratando vazio como zero
    const numericAmount = parseFloat(amount) || 0;
    try {
      const result = await updateWishlistSavedAmount(item.id, numericAmount);
      if (result.success) {
        onClose();
      } else {
        alert(result.error || "Erro ao atualizar valor.");
      }
    } catch (error) {
      alert("Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = item.price.amount > 0 
    ? ((parseFloat(amount) || 0) / item.price.amount) * 100 
    : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Se o usuário apagar tudo, deixa vazio. Se digitar, limpa zeros à esquerda.
    if (value === "") {
      setAmount("");
      return;
    }
    const cleanedValue = value.replace(/^0+(?=\d)/, '');
    setAmount(cleanedValue);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-xs p-5 animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-lg font-bold text-white">Atualizar Progresso</h2>
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-zinc-400 mb-1">{item.name}</p>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">
            Meta: {item.price.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="saved-amount" className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">
              Quanto você já guardou?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">R$</span>
              <input
                id="saved-amount"
                type="number"
                step="0.01"
                min="0"
                max={item.price.amount}
                value={amount}
                onChange={handleAmountChange}
                onFocus={(e) => e.target.select()}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-10 py-3 text-white outline-none focus:border-emerald-500 transition-colors font-mono"
                autoFocus
                required
              />
            </div>
            <p className="text-[10px] text-zinc-500 italic">
              Isso representa {progressPercent.toFixed(1)}% do total.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-white font-bold py-2 rounded hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Salvando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
