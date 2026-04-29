"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { differenceInDays } from "date-fns";

interface AveragePaymentTimeProps {
  invoices: InvoiceEntity[];
}

export function AveragePaymentTime({ invoices }: AveragePaymentTimeProps) {
  const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.paid);
  
  const totalDays = paidInvoices.reduce((sum, inv) => {
    const due = new Date(inv.dueDate);
    const paid = new Date(inv.updatedAt);
    // Difference between due date and payment (updatedAt)
    // Positive means paid before due date, negative means after
    return sum + differenceInDays(due, paid);
  }, 0);

  const avgDays = paidInvoices.length > 0 ? (totalDays / paidInvoices.length) : 0;
  const isPositive = avgDays >= 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700/50 transition-all">
      <div className="flex items-center gap-2 mb-4 text-zinc-400">
        <Clock size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Média de Antecipação</h3>
      </div>

      <div className="flex items-end gap-3">
        <span className={`text-5xl font-black font-mono ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {Math.abs(avgDays).toFixed(1)}
        </span>
        <div className="flex flex-col pb-1">
            <span className="text-xs font-bold text-zinc-500 uppercase">Dias</span>
            <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                <span className="text-[10px] font-bold uppercase tracking-tight">
                    {isPositive ? 'de adiantamento' : 'de atraso médio'}
                </span>
            </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-zinc-500 leading-relaxed italic">
        {paidInvoices.length > 0 
          ? `Cálculo baseado em ${paidInvoices.length} faturas liquidadas no período.`
          : "Aguardando mais pagamentos para calcular sua média real."}
      </p>
    </div>
  );
}
