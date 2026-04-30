"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { ShieldAlert, Info, CheckCircle2 } from "lucide-react";

interface IncomeEmergencyBufferProps {
  incomes: IncomeEntity[];
  invoices: InvoiceEntity[];
}

export function IncomeEmergencyBuffer({ incomes, invoices }: IncomeEmergencyBufferProps) {
  const recurringExpenses = invoices
    .filter(i => i.recurrence.isRecurring)
    .reduce((sum, i) => sum + i.price.amount, 0);

  // Check volatility to define multiplier
  const monthlyTotals = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    return incomes.filter(inc => new Date(inc.date).getMonth() === d.getMonth()).reduce((s, inc) => s + inc.amount.amount, 0);
  }).filter(v => v > 0);

  const avg = monthlyTotals.length > 0 ? monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length : 0;
  const stdDev = Math.sqrt(monthlyTotals.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / (monthlyTotals.length || 1));
  const volatility = avg > 0 ? (stdDev / avg) : 0;

  // Rule: 6 months for stable, 12 months for volatile
  const monthsNeeded = volatility > 0.2 ? 12 : 6;
  const recommendedBuffer = recurringExpenses * monthsNeeded;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <ShieldAlert size={18} className="text-emerald-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Reserva de Emergência Ideal</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center text-center">
        <p className="text-3xl font-black text-white font-mono mb-1">
            {recommendedBuffer.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Alvo Sugerido</p>
        
        <div className="mt-6 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-500 font-bold uppercase">Perfil de Risco</span>
                <span className={`font-black uppercase ${volatility > 0.2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {volatility > 0.2 ? 'Renda Instável' : 'Renda Estável'}
                </span>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-bold uppercase">Meses de Segurança</span>
                <span className="text-white font-black">{monthsNeeded} MESES</span>
            </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 text-[9px] text-zinc-500 leading-tight">
        <Info size={14} className="shrink-0 text-zinc-600" />
        <p>Cálculo baseado no seu custo fixo mensal de {recurringExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} e na volatilidade da sua renda.</p>
      </div>
    </div>
  );
}
