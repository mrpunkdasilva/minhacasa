"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import {
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Calculator,
} from "lucide-react";

interface ShoppingTotalProps {
  items: MarketItem[];
  prices: Record<string, number>;
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ShoppingTotal({ items, prices }: ShoppingTotalProps) {
  const { total, pendingTotal, pricedCount, missingPrice } = useMemo(() => {
    const resolve = (item: MarketItem) =>
      prices[item.id] ?? item.lastPrice?.amount;

    let total = 0;
    let pendingTotal = 0;
    let pricedCount = 0;
    let missingPrice = 0;

    for (const item of items) {
      const unitPrice = resolve(item);
      if (unitPrice === undefined || unitPrice === null) {
        missingPrice += 1;
        continue;
      }
      pricedCount += 1;
      const lineTotal = unitPrice * item.quantity;
      total += lineTotal;
      if (!item.isBought) pendingTotal += lineTotal;
    }

    return { total, pendingTotal, pricedCount, missingPrice };
  }, [items, prices]);

  const isComplete = items.length > 0 && missingPrice === 0;

  return (
    <div className="sticky top-0 z-20 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Total da compra
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-white leading-none">
              {formatCurrency(total)}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">
              {pricedCount}/{items.length} precificados
            </span>
          </div>
          {total > 0 && pendingTotal > 0 && pendingTotal < total && (
            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
              Restam {formatCurrency(pendingTotal)} a comprar
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {missingPrice > 0 ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0" />
              <span className="text-[10px] font-black uppercase text-amber-500">
                {missingPrice} sem preço
              </span>
            </div>
          ) : (
            isComplete && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span className="text-[10px] font-black uppercase text-emerald-500">
                  tudo precificado
                </span>
              </div>
            )
          )}

          {/*
            A real navigation, not a tab switch: the calculator is its own
            route, so a Link keeps it shareable and back-button friendly.
          */}
          <Link
            href="/market/calculator"
            className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg text-xs font-black uppercase hover:bg-zinc-200 transition-colors"
          >
            <Calculator size={14} />
            Calculadora
          </Link>
        </div>
      </div>
    </div>
  );
}
