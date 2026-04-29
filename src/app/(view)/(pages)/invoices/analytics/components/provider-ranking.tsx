"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { Users } from "lucide-react";

interface ProviderRankingProps {
  invoices: InvoiceEntity[];
}

export function ProviderRanking({ invoices }: ProviderRankingProps) {
  const providerDataMap = invoices.reduce((acc, inv) => {
    const name = inv.name.split(' ')[0]; // Take first word as simple provider identification
    if (!acc[name]) acc[name] = { total: 0, count: 0 };
    acc[name].total += inv.price.amount;
    acc[name].count += 1;
    return acc;
  }, {} as Record<string, { total: number, count: number }>);

  const data = Object.entries(providerDataMap)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Users size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Ranking de Fornecedores</h3>
      </div>

      <div className="space-y-4">
        {data.map((provider, index) => (
          <div key={provider.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-600 font-mono w-4">#{index + 1}</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-tight">{provider.name}</span>
                <span className="text-[10px] text-zinc-500">{provider.count} fatura{provider.count !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-emerald-500 font-mono">
                {provider.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <div className="w-24 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500/50" 
                  style={{ width: `${(provider.total / data[0].total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
