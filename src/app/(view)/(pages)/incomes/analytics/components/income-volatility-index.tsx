"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { Activity, ShieldCheck, AlertCircle } from "lucide-react";

interface IncomeVolatilityIndexProps {
  incomes: IncomeEntity[];
}

export function IncomeVolatilityIndex({ incomes }: IncomeVolatilityIndexProps) {
  const monthlyTotals = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return incomes
        .filter(inc => {
            const d = new Date(inc.date);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inc) => sum + inc.amount.amount, 0);
  }).filter(v => v > 0);

  if (monthlyTotals.length < 2) return null;

  const avg = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
  const stdDev = Math.sqrt(monthlyTotals.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / monthlyTotals.length);
  const volatility = (stdDev / avg) * 100; // Coefficient of variation

  const isStable = volatility < 15;
  const isModerate = volatility >= 15 && volatility < 30;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Activity size={18} className={isStable ? 'text-emerald-500' : 'text-amber-500'} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Índice de Volatilidade</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center text-center">
        <p className={`text-4xl font-black font-mono mb-2 ${isStable ? 'text-emerald-500' : isModerate ? 'text-amber-500' : 'text-rose-500'}`}>
            {volatility.toFixed(1)}%
        </p>
        <p className="text-xs font-bold text-white uppercase tracking-widest">
            {isStable ? 'Renda Estável' : isModerate ? 'Renda Variável' : 'Alta Volatilidade'}
        </p>
        <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed">
            Sua renda mensal oscila cerca de <span className="text-zinc-300 font-bold">{stdDev.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span> para cima ou para baixo em relação à média.
        </p>
      </div>

      <div className="mt-6 p-3 rounded-lg bg-zinc-800/50 flex items-center gap-3">
        {isStable ? <ShieldCheck className="text-emerald-500" size={16} /> : <AlertCircle className="text-amber-500" size={16} />}
        <p className="text-[9px] text-zinc-400 font-medium">
            {isStable 
                ? "Ótima previsibilidade. Você pode planejar investimentos fixos com segurança." 
                : "Atenção: Recomendamos manter uma reserva de emergência maior devido às oscilações."}
        </p>
      </div>
    </div>
  );
}

import { subMonths } from "date-fns";
