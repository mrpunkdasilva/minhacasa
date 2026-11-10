"use client";

import { useState, useTransition, useMemo } from "react";
import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import {
  toggleItemBought,
  deleteMarketItem,
  setMarketItemPrice,
} from "@/app/infra/actions/market.actions";
import {
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  ShoppingCart,
  Archive,
} from "lucide-react";
import AddMarketItemDialog from "./AddMarketItemDialog";
import EditMarketItemDialog from "./EditMarketItemDialog";
import { ImportReceiptButton } from "./receipt-scanner-dialog";
import ShoppingTotal from "./shopping-total";
import {
  MarketPriority,
  MarketCategory,
  MarketUnit,
  MarketUnitAbbreviation,
} from "@/app/domain/enums/market-category/market-category";
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
  const [prices, setPrices] = useState<Record<string, number | null>>({});

  // Memoised because it feeds a dependency array: a fresh [] on every render
  // would defeat the useMemo below and re-filter on each keystroke.
  const safeItems = useMemo(
    () => (Array.isArray(initialItems) ? initialItems : []),
    [initialItems],
  );

  // null means the user cleared the price: it is optional and stays empty.
  const getUnitPrice = (item: MarketItem) => {
    const override = prices[item.id];
    if (override === null) return undefined;
    return override ?? item.lastPrice?.amount;
  };

  const handleToggleBought = async (id: string, isBought: boolean) => {
    startTransition(async () => {
      await toggleItemBought(id, isBought);
    });
  };

  const handlePriceChange = (id: string, raw: string) => {
    const parsed = parseFloat(raw.replace(",", "."));
    setPrices((current) => ({
      ...current,
      [id]:
        !raw.trim() || !Number.isFinite(parsed) || parsed < 0 ? null : parsed,
    }));
  };

  const handlePriceCommit = (id: string) => {
    const amount = prices[id];
    if (amount === undefined) return;
    startTransition(async () => {
      await setMarketItemPrice(id, amount ?? undefined);
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
        const matchesSearch = item.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" || item.category === categoryFilter;
        const matchesPriority =
          priorityFilter === "all" || item.priority === priorityFilter;
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
    [MarketPriority.MEDIUM]:
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    [MarketPriority.HIGH]: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    [MarketPriority.URGENT]:
      "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-xs text-zinc-500">
          {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "item encontrado" : "itens encontrados"}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ImportReceiptButton label="Importar nota fiscal" />
          <AddMarketItemDialog />
        </div>
      </div>

      <ShoppingTotal items={safeItems} prices={prices} />

      {/* Filters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 bg-zinc-900/50 p-2 sm:p-3 rounded-xl border border-zinc-800">
        <div className="relative col-span-2 sm:col-span-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={16}
          />
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
              <SelectItem key={key} value={value}>
                {value}
              </SelectItem>
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
              <SelectItem key={key} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <ShoppingCart className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 font-medium">
              Nenhum item encontrado com esses filtros.
            </p>
            {(search ||
              categoryFilter !== "all" ||
              priorityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setPriorityFilter("all");
                }}
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
              className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-300 min-w-0 overflow-hidden ${
                item.isBought
                  ? "bg-zinc-900/30 border-zinc-900/50 opacity-50 scale-[0.98]"
                  : "bg-zinc-900 border-zinc-800 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    checked={item.isBought}
                    disabled={isPending}
                    onChange={(e) =>
                      handleToggleBought(item.id, e.target.checked)
                    }
                    className="peer w-6 h-6 rounded-lg border-2 border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 appearance-none transition-all checked:border-emerald-500 checked:bg-emerald-500"
                  />
                  <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-black font-bold text-xs transition-all">
                    ✓
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3
                      className={`truncate font-semibold tracking-tight ${item.isBought ? "line-through text-zinc-500" : "text-white text-base sm:text-lg"}`}
                    >
                      {item.name}
                    </h3>
                    {item.priority && !item.isBought && (
                      <span
                        className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter ${priorityStyles[item.priority as MarketPriority]}`}
                      >
                        {item.priority}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest bg-black/40 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.shouldMoveToInventory && !item.isBought && (
                      <span className="flex items-center gap-1 text-[9px] text-emerald-500/60 font-bold uppercase">
                        <Archive size={10} /> Move p/ Despensa
                      </span>
                    )}
                    {getUnitPrice(item) !== undefined && (
                      <span className="text-[10px] text-zinc-500 font-bold">
                        Total:{" "}
                        {(
                          getUnitPrice(item)! * (item.quantity ?? 1)
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-3 pl-9 sm:pl-0 min-w-0">
                {item.quantity !== undefined && (
                  <span className="whitespace-nowrap text-xs sm:text-sm font-black text-white bg-zinc-800 px-2 sm:px-3 py-1 rounded-lg">
                    {item.quantity}{" "}
                    <span className="text-zinc-500 text-[10px] ml-1 uppercase">
                      {MarketUnitAbbreviation[item.unit as MarketUnit] ??
                        item.unit.split(" ")[0]}
                    </span>
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-zinc-600 font-bold uppercase">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="preço (opcional)"
                    value={getUnitPrice(item)?.toString() ?? ""}
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    onBlur={() => handlePriceCommit(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className={`w-16 sm:w-24 text-right text-[11px] font-black bg-transparent border-b outline-none transition-colors focus:border-emerald-500 ${
                      getUnitPrice(item) === undefined
                        ? "border-zinc-700 text-zinc-400 placeholder:text-zinc-600"
                        : "border-zinc-700 text-white"
                    }`}
                  />
                </div>

                <EditMarketItemDialog item={item} />

                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="p-2 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all disabled:opacity-50"
                  title="Excluir item"
                >
                  <Trash2 size={18} className="sm:hidden" />
                  <Trash2 size={20} className="hidden sm:block" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
