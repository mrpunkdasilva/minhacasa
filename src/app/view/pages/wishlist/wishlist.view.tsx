"use client";

import WishlistSummary from "./components/wishlist-summary";
import WishlistGrid from "./components/wishlist-grid";

export default function WishlistView() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl min-h-screen bg-black">
      <div className="flex flex-col space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Lista de Desejos</h1>
            <p className="text-zinc-500 mt-2">Planeje suas conquistas e acompanhe seu progresso de economia.</p>
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-md font-bold text-sm hover:bg-zinc-200 transition-all">
            + Adicionar Desejo
          </button>
        </div>

        <WishlistSummary />

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 className="text-xl font-semibold">Seus Itens</h2>
            <div className="flex gap-2">
              <select className="bg-zinc-900 text-zinc-400 text-xs border border-zinc-800 rounded px-2 py-1 outline-none focus:border-emerald-500">
                <option>Todas as Categorias</option>
              </select>
              <select className="bg-zinc-900 text-zinc-400 text-xs border border-zinc-800 rounded px-2 py-1 outline-none focus:border-emerald-500">
                <option>Maior Prioridade</option>
              </select>
            </div>
          </div>
          
          <WishlistGrid />
        </div>
      </div>
    </div>
  );
}
