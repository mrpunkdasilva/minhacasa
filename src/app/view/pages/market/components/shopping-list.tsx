"use client";

import { useState } from "react";
import { shoppingListMock } from "@/app/infra/mocks/market/market.mock";

export default function ShoppingList() {
  const [items, setItems] = useState(shoppingListMock);

  const toggleBought = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isBought: !item.isBought } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Compras</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium">
          Adicionar Item
        </button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              item.isBought
                ? "bg-zinc-900/50 border-zinc-800 opacity-50"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={item.isBought}
                onChange={() => toggleBought(item.id)}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <h3
                  className={`font-medium ${item.isBought ? "line-through text-zinc-500" : "text-white"}`}
                >
                  {item.name}
                </h3>
                <span className="text-xs text-zinc-500">{item.category}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block font-mono text-sm text-white">
                {item.quantity} {item.unit}
              </span>
              <span className="text-xs text-zinc-500">
                Est.{" "}
                {item.lastPrice?.amount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
