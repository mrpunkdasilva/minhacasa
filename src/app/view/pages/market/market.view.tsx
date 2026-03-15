"use client";

import { useState } from "react";
import ShoppingList from "./components/shopping-list";
import Inventory from "./components/inventory";
import MarketAnalysis from "./components/market-analysis";

type MarketTab = "shopping" | "inventory" | "analysis";

export default function MarketView() {
  const [activeTab, setActiveTab] = useState<MarketTab>("shopping");

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl min-h-screen bg-black">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Mercado</h1>
          <p className="text-zinc-500 mt-2">
            Sua lista de compras, despensa e análise de gastos em um só lugar.
          </p>
        </div>

        <div className="flex border-b border-zinc-800 overflow-x-auto no-scrollbar scrollbar-hide">
          <button
            onClick={() => setActiveTab("shopping")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === "shopping"
                ? "text-emerald-500"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Lista de Compras
            {activeTab === "shopping" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === "inventory"
                ? "text-emerald-500"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Minha Despensa
            {activeTab === "inventory" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === "analysis"
                ? "text-emerald-500"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Análise de Gastos
            {activeTab === "analysis" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "shopping" && <ShoppingList />}
          {activeTab === "inventory" && <Inventory />}
          {activeTab === "analysis" && <MarketAnalysis />}
        </div>
      </div>
    </div>
  );
}
