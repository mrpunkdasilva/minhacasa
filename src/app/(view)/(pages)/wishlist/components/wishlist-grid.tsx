"use client";

import { wishlistMock } from "@/app/infra/mocks/wishlist/wishlist.mock";
import { WishlistPriority } from "@/app/domain/enums/wishlist/wishlist-priority";

export default function WishlistGrid() {
  const priorityStyles = {
    [WishlistPriority.LOW]: "bg-blue-500/10 text-blue-500",
    [WishlistPriority.MEDIUM]: "bg-zinc-500/10 text-zinc-400",
    [WishlistPriority.HIGH]: "bg-amber-500/10 text-amber-500",
    [WishlistPriority.URGENT]: "bg-rose-500/10 text-rose-500",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistMock.map((item) => {
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
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${priorityStyles[item.priority]}`}
                >
                  {item.priority}
                </span>
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
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>
                    {item.savedAmount.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <span>
                    Faltam{" "}
                    {(
                      item.price.amount - item.savedAmount.amount
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs bg-zinc-800 text-white py-2 rounded hover:bg-zinc-700 transition-colors"
                >
                  Ver na Loja ↗
                </a>
              )}

              {item.isPurchased && (
                <div className="text-center text-[10px] text-emerald-500 font-bold uppercase tracking-widest pt-2">
                  ✓ Adquirido
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
