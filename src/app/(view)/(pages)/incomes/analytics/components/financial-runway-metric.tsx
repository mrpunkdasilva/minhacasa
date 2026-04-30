"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { Plane, Info } from "lucide-react";

interface FinancialRunwayMetricProps {
  incomes: IncomeEntity[];
  invoices: InvoiceEntity[];
}

export function FinancialRunwayMetric({ incomes, invoices }: FinancialRunwayMetricProps) {
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount.amount, 0);
  const totalExpenses = invoices.reduce((sum, inv) => sum + inv.price.amount, 0);
  
  // Estimate current savings as total history surplus (simplified)
  const estimatedSavings = Math.max(0, totalIncome - totalExpenses);
  
  // Average monthly burn rate (last 6 months)
  const monthlyBurnRate = totalExpenses / 6;

  const runwayMonths = monthlyBurnRate > 0 ? estimatedSavings / monthlyBurnRate : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Plane size={18} className="text-blue-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Financial Runway</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center text-center">
        <p className="text-5xl font-black text-white font-mono mb-2">
            {runwayMonths.toFixed(1)}
        </p>
        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Meses de Autonomia</p>
        <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed">
            Se sua renda parasse hoje, suas economias cobririam seus gastos por <span className="text-zinc-300 font-bold">{runwayMonths.toFixed(1)} meses</span> mantendo seu padrão de vida atual.
        </p>
      </div>

      <div className="mt-6 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-start gap-2">
        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[9px] text-zinc-400">
            Consideramos uma economia estimada de {estimatedSavings.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} e um custo mensal de {monthlyBurnRate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.
        </p>
      </div>
    </div>
  );
}
