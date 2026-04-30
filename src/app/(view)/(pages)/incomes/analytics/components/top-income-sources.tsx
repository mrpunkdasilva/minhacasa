"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { LayoutGrid } from "lucide-react";

interface TopIncomeSourcesProps {
  incomes: IncomeEntity[];
}

export function TopIncomeSources({ incomes }: TopIncomeSourcesProps) {
  const sourceData = incomes.reduce((acc, inc) => {
    if (!acc[inc.name]) acc[inc.name] = 0;
    acc[inc.name] += inc.amount.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(sourceData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const total = incomes.reduce((sum, i) => sum + i.amount.amount, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <LayoutGrid size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Principais Fontes</h3>
      </div>

      <div className="space-y-5">
        {data.map((source, index) => (
            <div key={source.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-bold uppercase tracking-tight flex items-center gap-2">
                        <span className="text-zinc-600 font-mono">0{index + 1}</span>
                        {source.name}
                    </span>
                    <span className="text-emerald-500 font-black font-mono">
                        {source.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500/60 rounded-full transition-all duration-1000"
                        style={{ width: `${(source.value / data[0].value) * 100}%` }}
                    ></div>
                </div>
                <p className="text-[10px] text-zinc-500 text-right">
                    {((source.value / total) * 100).toFixed(1)}% do total
                </p>
            </div>
        ))}
      </div>
    </div>
  );
}
