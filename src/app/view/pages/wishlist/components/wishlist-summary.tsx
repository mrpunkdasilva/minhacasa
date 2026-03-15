"use client";

import { wishlistMock } from "@/app/infra/mocks/wishlist/wishlist.mock";

export default function WishlistSummary() {
  const pendingItems = wishlistMock.filter((i) => !i.isPurchased);
  const totalValue = pendingItems.reduce((acc, i) => acc + i.price, 0);
  const totalSaved = pendingItems.reduce((acc, i) => acc + i.savedAmount, 0);
  const overallProgress = (totalSaved / totalValue) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between h-32">
        <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
          Total da Lista
        </h3>
        <div>
          <span className="text-2xl font-bold font-mono text-white">
            {totalValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
          <p className="text-[10px] text-zinc-500 mt-1">
            {pendingItems.length} itens pendentes
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between h-32">
        <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
          Já Economizado
        </h3>
        <div>
          <span className="text-2xl font-bold font-mono text-emerald-500">
            {totalSaved.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
          <p className="text-[10px] text-zinc-500 mt-1">
            Soma de todo o progresso
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-emerald-500/20 rounded-lg p-6 flex flex-col justify-between h-32">
        <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
          Conclusão Geral
        </h3>
        <div className="space-y-2">
          <span className="text-2xl font-bold font-mono text-white">
            {overallProgress.toFixed(1)}%
          </span>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
