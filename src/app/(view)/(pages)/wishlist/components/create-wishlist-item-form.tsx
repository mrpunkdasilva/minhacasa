"use client";

import { useState } from "react";
import { addWishlistItem } from "@/app/infra/actions/wishlist.actions";
import { WishlistPriority } from "@/app/domain/enums/wishlist/wishlist-priority";
import { WishlistCategory } from "@/app/domain/enums/wishlist/wishlist-category";

interface CreateWishlistItemFormProps {
  onClose: () => void;
}

export default function CreateWishlistItemForm({ onClose }: CreateWishlistItemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState("");
  const [savedAmount, setSavedAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    // Ensure we send the controlled values, defaulting to 0 if empty
    formData.set("price", price || "0");
    formData.set("savedAmount", savedAmount || "0");

    try {
      const result = await addWishlistItem(formData);
      if (result.success) {
        onClose();
      } else {
        alert(result.error || "Erro ao adicionar item.");
      }
    } catch (error) {
      alert("Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumericChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setter("");
      return;
    }
    const cleanedValue = value.replace(/^0+(?=\d)/, '');
    setter(cleanedValue);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Novo Desejo</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Nome do Item</label>
            <input
              name="name"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
              placeholder="Ex: PlayStation 5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Preço Estimado</label>
              <input
                name="price"
                type="number"
                step="0.01"
                value={price}
                onChange={handleNumericChange(setPrice)}
                onFocus={(e) => e.target.select()}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Já Economizado</label>
              <input
                name="savedAmount"
                type="number"
                step="0.01"
                value={savedAmount}
                onChange={handleNumericChange(setSavedAmount)}
                onFocus={(e) => e.target.select()}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Categoria</label>
              <select
                name="category"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
              >
                {Object.entries(WishlistCategory).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Prioridade</label>
              <select
                name="priority"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
              >
                {Object.entries(WishlistPriority).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Link (Opcional)</label>
            <input
              name="url"
              type="url"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 text-black font-bold py-3 rounded mt-4 hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Adicionando..." : "Criar Desejo"}
          </button>
        </form>
      </div>
    </div>
  );
}
