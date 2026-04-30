"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { Scale, Zap, ShieldCheck } from "lucide-react";

interface ExpenseCoverageRatioProps {
  incomes: IncomeEntity[];
  invoices: InvoiceEntity[];
}

export function ExpenseCoverageRatio({ incomes, invoices }: ExpenseCoverageRatioProps) {
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount.amount, 0);
  const recurringExpenses = invoices
    .filter(inv => inv.recurrence.isRecurring)
    .reduce((sum, inv) => sum + inv.price.amount, 0);

  const coverage = recurringExpenses > 0 ? totalIncome / recurringExpenses : 10;
  
  const isHealthy = coverage >= 1.5;
  const isCritical = coverage < 1.1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Scale size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Fator de Cobertura</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center text-center">
        <p className={`text-5xl font-black font-mono mb-2 ${isHealthy ? 'text-emerald-500' : isCritical ? 'text-rose-500' : 'text-amber-500'}`}>
            {coverage.toFixed(1)}x
        </p>
        <p className="text-xs font-bold text-white uppercase tracking-widest">Cobertura de Custos Fixos</p>
        
        <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-500">
                <span>Receita</span>
                <span className="text-white">{totalIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (totalIncome / (recurringExpenses * 2)) * 100)}%` }}
                ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-500">
                <span>Recorrentes</span>
                <span className="text-rose-500/80">{recurringExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
        {isHealthy ? <ShieldCheck className="text-emerald-500" size={16} /> : <Zap className="text-amber-500" size={16} />}
        <p className="text-[9px] text-zinc-400 leading-tight">
            {isHealthy 
                ? "Sua receita cobre com folga todas as despesas recorrentes. Excelente saúde financeira!" 
                : "Atenção: Sua receita está muito próxima do limite das despesas fixas. Considere reduzir custos."}
        </p>
      </div>
    </div>
  );
}
