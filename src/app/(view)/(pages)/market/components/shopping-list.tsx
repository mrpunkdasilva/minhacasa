"use client";

import { useState, useTransition, useMemo } from "react";
import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import { toggleItemBought, deleteMarketItem } from "@/app/infra/actions/market.actions";
import { Trash2, Search, Filter, ArrowUpDown, AlertCircle, ShoppingCart, Archive } from "lucide-react";
import AddMarketItemDialog from "./AddMarketItemDialog";
import { MarketPriority, MarketCategory } from "@/app/domain/enums/market-category/market-category";
import { Input } from "@/app/(view)/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(view)/components/ui/select";

interface ShoppingListProps {
  initialItems?: MarketItem[];
}

export default function ShoppingList({ initialItems = [] }: ShoppingListProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const safeItems = Array.isArray(initialItems) ? initialItems : [];

  const handleToggleBought = async (id: string, isBought: boolean) => {
    startTransition(async () => {
      await toggleItemBought(id, isBought);
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este item da lista?")) {
      startTransition(async () => {
        await deleteMarketItem(id);
      });
    }
  };

  const filteredItems = useMemo(() => {
    return safeItems
      .filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
        return matchesSearch && matchesCategory && matchesPriority;
      })
      .sort((a, b) => {
        // Sort by bought status first (unbought first)
        if (a.isBought !== b.isBought) return a.isBought ? 1 : -1;
        
        // Then by priority
        const priorityOrder = {
          [MarketPriority.URGENT]: 0,
          [MarketPriority.HIGH]: 1,
          [MarketPriority.MEDIUM]: 2,
          [MarketPriority.LOW]: 3,
        };
        const priorityA = priorityOrder[a.priority as MarketPriority] ?? 4;
        const priorityB = priorityOrder[b.priority as MarketPriority] ?? 4;
        if (priorityA !== priorityB) return priorityA - priorityB;

        return a.name.localeCompare(b.name);
      });
  }, [safeItems, search, categoryFilter, priorityFilter]);

  const priorityStyles = {
    [MarketPriority.LOW]: "bg-zinc-800 text-zinc-400 border-zinc-700",
    [MarketPriority.MEDIUM]: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    [MarketPriority.HIGH]: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    [MarketPriority.URGENT]: "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Lista de Compras</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {filteredItems.length} {filteredItems.length === 1 ? "item encontrado" : "itens encontrados"}
          </p>
        </div>
        <AddMarketItemDialog />
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <Input
            placeholder="Buscar item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black border-zinc-800 h-10 text-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-black border-zinc-800 h-10 text-sm">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-zinc-500" />
              <SelectValue placeholder="Categoria" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {Object.entries(MarketCategory).map(([key, value]) => (
              <SelectItem key={key} value={value}>{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="bg-black border-zinc-800 h-10 text-sm">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-zinc-500" />
              <SelectValue placeholder="Prioridade" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
            <SelectItem value="all">Todas as Prioridades</SelectItem>
            {Object.entries(MarketPriority).map(([key, value]) => (
              <SelectItem key={key} value={value}>{value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <ShoppingCart className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 font-medium">Nenhum item encontrado com esses filtros.</p>
            {(search || categoryFilter !== "all" || priorityFilter !== "all") && (
              <button 
                onClick={() => {setSearch(""); setCategoryFilter("all"); setPriorityFilter("all");}}
                className="text-emerald-500 text-sm mt-2 hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                item.isBought
                  ? "bg-zinc-900/30 border-zinc-900/50 opacity-50 scale-[0.98]"
                  : "bg-zinc-900 border-zinc-800 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={item.isBought}
                    disabled={isPending}
                    onChange={(e) => handleToggleBought(item.id, e.target.checked)}
                    className="peer w-6 h-6 rounded-lg border-2 border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 appearance-none transition-all checked:border-emerald-500 checked:bg-emerald-500"
                  />
                  <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-black font-bold text-xs transition-all">
                    ✓
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-semibold tracking-tight ${item.isBought ? "line-through text-zinc-500" : "text-white text-lg"}`}
                    >
                      {item.name}
                    </h3>
                    {item.priority && !item.isBought && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter ${priorityStyles[item.priority as MarketPriority]}`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest bg-black/40 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.shouldMoveToInventory && !item.isBought && (
                      <span className="flex items-center gap-1 text-[9px] text-emerald-500/60 font-bold uppercase">
                        <Archive size={10} /> Move p/ Despensa
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-black text-white bg-zinc-800 px-3 py-1 rounded-lg">
                    {item.quantity} <span className="text-zinc-500 text-[10px] ml-1 uppercase">{item.unit.split(" ")[0]}</span>
                  </span>
                  {item.lastPrice && (
                    <span className="text-[10px] text-zinc-600 font-bold mt-1">
                      Último: {item.lastPrice.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="p-2 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50"
                  title="Excluir item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
