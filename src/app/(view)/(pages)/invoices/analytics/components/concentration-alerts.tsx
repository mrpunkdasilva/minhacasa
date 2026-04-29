"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ConcentrationAlertsProps {
  invoices: InvoiceEntity[];
}

export function ConcentrationAlerts({ invoices }: ConcentrationAlertsProps) {
  const topInvoices = [...invoices]
    .sort((a, b) => b.price.amount - a.price.amount)
    .slice(0, 5);

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.price.amount, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <AlertTriangle size={18} className="text-amber-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Alertas de Concentração</h3>
      </div>

      <div className="space-y-4">
        {topInvoices.map((invoice) => {
          const percentage = ((invoice.price.amount / totalAmount) * 100).toFixed(1);
          return (
            <div key={invoice.id} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:border-zinc-500/30 transition-all">
              <div className="flex flex-col">
                <Link href={`/invoices/${invoice.id}`} className="text-sm font-bold text-white group-hover:text-emerald-500 flex items-center gap-1">
                  {invoice.name}
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">
                  {invoice.category} • {percentage}% do total
                </p>
              </div>
              <div className="text-right font-mono font-bold text-white">
                {invoice.price.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
        <p className="text-[11px] text-amber-500/80 leading-relaxed font-medium">
          As 5 maiores faturas representam {((topInvoices.reduce((s, i) => s + i.price.amount, 0) / totalAmount) * 100).toFixed(1)}% do seu orçamento total.
        </p>
      </div>
    </div>
  );
}
