"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { Search, AlertTriangle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface OutliersAnalysisProps {
  invoices: InvoiceEntity[];
}

export function OutliersAnalysis({ invoices }: OutliersAnalysisProps) {
  if (invoices.length < 5) return null;

  const amounts = invoices.map(i => i.price.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / amounts.length);
  
  // An outlier is typically defined as being more than 2 standard deviations away from the mean
  const threshold = avg + 2 * stdDev;
  const outliers = invoices
    .filter(inv => inv.price.amount > threshold)
    .sort((a, b) => b.price.amount - a.price.amount);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Search size={18} className="text-amber-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Detecção de Outliers</h3>
      </div>

      {outliers.length > 0 ? (
        <div className="space-y-4">
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
                Identificamos <span className="text-amber-500 font-bold">{outliers.length} faturas</span> com valores significativamente acima da sua média habitual de {avg.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.
            </p>
            {outliers.map(inv => (
                <div key={inv.id} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-between group">
                    <div className="flex flex-col">
                        <Link href={`/invoices/${inv.id}`} className="text-xs font-bold text-white group-hover:text-amber-500 flex items-center gap-1">
                            {inv.name}
                            <ArrowUpRight size={10} />
                        </Link>
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">{inv.category}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-rose-500 font-mono">
                            {inv.price.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-bold">
                            + {((inv.price.amount / avg - 1) * 100).toFixed(0)}% ACIMA DA MÉDIA
                        </p>
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <AlertTriangle size={24} />
            </div>
            <p className="text-xs font-bold text-white uppercase mb-1">Padrão Estável</p>
            <p className="text-[10px] text-zinc-500 max-w-[200px]">Nenhuma anomalia de valor detectada no período selecionado.</p>
        </div>
      )}
    </div>
  );
}
