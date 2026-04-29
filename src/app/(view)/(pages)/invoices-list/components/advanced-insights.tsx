"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { BarChart3 } from "lucide-react";

interface AdvancedInsightsProps {
  invoices: InvoiceEntity[];
}

export function AdvancedInsights({ invoices }: AdvancedInsightsProps) {
  if (invoices.length === 0) {
    return null;
  }

  // Calculate statistics
  const amounts = invoices.map((inv) => inv.price.amount);
  const total = amounts.reduce((a, b) => a + b, 0);
  // Standard deviation
  const median =
    amounts.length % 2 === 0
      ? (amounts.sort((a, b) => a - b)[amounts.length / 2 - 1] +
          amounts.sort((a, b) => a - b)[amounts.length / 2]) /
        2
      : amounts.sort((a, b) => a - b)[Math.floor(amounts.length / 2)];

  // Standard deviation
  const variance =
    amounts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
    amounts.length;
  const stdDev = Math.sqrt(variance);

  // Min and Max
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);

  // Category statistics
  const categoryStats = invoices.reduce(
    (acc, inv) => {
      if (!acc[inv.category]) {
        acc[inv.category] = {
          count: 0,
          total: 0,
          average: 0,
        };
      }
      acc[inv.category].count += 1;
      acc[inv.category].total += inv.price.amount;
      acc[inv.category].average =
        acc[inv.category].total / acc[inv.category].count;
      return acc;
    },
    {} as Record<string, { count: number; total: number; average: number }>,
  );

  // Find most expensive category
  const mostExpensiveCategory = Object.entries(categoryStats).sort(
    (a, b) => b[1].total - a[1].total,
  )[0];

  // Find most frequent category
  const mostFrequentCategory = Object.entries(categoryStats).sort(
    (a, b) => b[1].count - a[1].count,
  )[0];

  // Recurring vs Non-recurring
  const recurringCount = invoices.filter(
    (inv) => inv.recurrence.isRecurring,
  ).length;
  const recurringAmount = invoices
    .filter((inv) => inv.recurrence.isRecurring)
    .reduce((sum, inv) => sum + inv.price.amount, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <BarChart3 size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Insights Estatísticos
        </h3>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
            Valor Médio
          </p>
          <p className="text-lg font-bold text-emerald-500 font-mono">
            {average.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            de {invoices.length} faturas
          </p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
            Mediana
          </p>
          <p className="text-lg font-bold text-blue-500 font-mono">
            {median.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">valor central</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
            Desvio Padrão
          </p>
          <p className="text-lg font-bold text-violet-500 font-mono">
            {stdDev.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">variabilidade</p>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
            Amplitude
          </p>
          <p className="text-lg font-bold text-pink-500 font-mono">
            {(max - min).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            {min.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}{" "}
            a{" "}
            {max.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 pt-6 border-t border-zinc-800">
        {mostExpensiveCategory && (
          <div className="bg-linear-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 rounded-lg p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-3">
              Categoria Mais Cara
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  {mostExpensiveCategory[0]}
                </p>
                <p className="text-xs text-zinc-400">
                  {mostExpensiveCategory[1].count} fatura
                  {mostExpensiveCategory[1].count !== 1 ? "s" : ""}
                </p>
              </div>
              <p className="text-lg font-bold text-rose-500 font-mono">
                {mostExpensiveCategory[1].total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        )}

        {mostFrequentCategory && (
          <div className="bg-linear-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-3">
              Categoria Mais Frequente
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  {mostFrequentCategory[0]}
                </p>
                <p className="text-xs text-zinc-400">
                  média:{" "}
                  {mostFrequentCategory[1].average.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
              <p className="text-lg font-bold text-amber-500">
                {mostFrequentCategory[1].count}x
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recurring Analysis */}
      {recurringCount > 0 && (
        <div className="bg-linear-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
                Faturas Recorrentes
              </p>
              <p className="text-sm text-zinc-300">
                {recurringCount} de {invoices.length} (
                {((recurringCount / invoices.length) * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-cyan-500 font-mono mb-1">
                {recurringAmount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
              <p className="text-[10px] text-zinc-400">
                {(recurringAmount / recurringCount).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}{" "}
                média
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

