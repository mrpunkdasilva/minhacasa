"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Landmark, ArrowRight } from "lucide-react";

interface NetMarginAnalysisProps {
  incomes: IncomeEntity[];
  invoices: InvoiceEntity[];
}

export function NetMarginAnalysis({ incomes, invoices }: NetMarginAnalysisProps) {
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount.amount, 0);
  const totalExpenses = invoices.reduce((sum, inv) => sum + inv.price.amount, 0);
  const netProfit = Math.max(0, totalIncome - totalExpenses);
  const marginPercentage = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const data = [
    { name: "Despesas", value: totalExpenses, color: "#3f3f46" },
    { name: "Lucro Líquido", value: netProfit, color: "#10b981" },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-zinc-400">
            <Landmark size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Margem Líquida Real</h3>
        </div>
        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
            {marginPercentage.toFixed(1)}% MARGEM
        </span>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "10px" }}
                formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-bold">RECEITA TOTAL</span>
            <span className="text-white font-mono">{totalIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
        <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
            <span className="text-zinc-500 font-bold text-rose-500/80">SAÍDAS TOTAIS</span>
            <span className="text-white font-mono">({totalExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-emerald-500 font-black">SOBRA REAL</span>
            <span className="text-emerald-500 font-black font-mono">{netProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
      </div>
    </div>
  );
}
