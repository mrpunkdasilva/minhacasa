"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { Search, Sparkles, ArrowRight } from "lucide-react";

interface IncomeOutliersProps {
  incomes: IncomeEntity[];
}

export function IncomeOutliers({ incomes }: IncomeOutliersProps) {
  if (incomes.length < 5) return null;

  const amounts = incomes.map(i => i.amount.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / amounts.length);
  
  const threshold = avg + 1.5 * stdDev;
  const outliers = incomes
    .filter(inc => inc.amount.amount > threshold)
    .sort((a, b) => b.amount.amount - a.amount.amount);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Search size={18} className="text-emerald-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Ganhos Extraordinários</h3>
      </div>

      {outliers.length > 0 ? (
        <div className="space-y-4">
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
                Detectamos <span className="text-emerald-500 font-bold">{outliers.length} entradas</span> significativamente acima da sua média de {avg.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.
            </p>
            {outliers.map(inc => (
                <div key={inc.id} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between group">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-500 flex items-center gap-1 transition-colors">
                            {inc.name}
                            <Sparkles size={10} className="text-amber-500" />
                        </span>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">{inc.category}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-emerald-500 font-mono">
                            {inc.amount.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">
                            Impacto Positivo
                        </p>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
            <div className="size-12 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 mb-3">
                <Search size={24} />
            </div>
            <p className="text-xs font-bold text-white uppercase mb-1">Renda Regular</p>
            <p className="text-[10px] text-zinc-500 max-w-[200px]">Seus ganhos estão seguindo um padrão estável no momento.</p>
        </div>
      )}
    </div>
  );
}
