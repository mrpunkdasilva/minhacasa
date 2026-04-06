"use client";

import { useState } from "react";
import ShoppingList from "./components/shopping-list";
import Inventory from "./components/inventory";
import MarketAnalysis from "./components/market-analysis";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { MarketItem } from "@/app/domain/entity/market/market-item.entity";

type MarketTab = "shopping" | "inventory" | "analysis";

interface MarketViewClientProps {
  invoices: InvoiceEntity[];
  marketItems: MarketItem[];
}

export default function MarketViewClient({
  invoices,
  marketItems = [],
}: MarketViewClientProps) {
  const [activeTab, setActiveTab] = useState<MarketTab>("shopping");

  const safeMarketItems = Array.isArray(marketItems) ? marketItems : [];
  const shoppingListItems = safeMarketItems.filter((item) => !item.isInStock);
  const inventoryItems = safeMarketItems.filter((item) => item.isInStock);

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Mercado
        </h1>
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
        {activeTab === "shopping" && (
          <ShoppingList initialItems={shoppingListItems} />
        )}
        {activeTab === "inventory" && (
          <Inventory initialItems={inventoryItems} />
        )}
        {activeTab === "analysis" && (
          <MarketAnalysis invoices={invoices} marketItems={safeMarketItems} />
        )}
      </div>
    </div>
  );
}
