"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { BrainCircuit, AlertTriangle, ShieldCheck } from "lucide-react";

interface OverduePredictionProps {
  invoices: InvoiceEntity[];
}

export function OverduePrediction({ invoices }: OverduePredictionProps) {
  const unpaidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.unpaid);
  
  // Simple risk heuristic for prediction
  const riskAnalysis = unpaidInvoices.map(inv => {
    const dueDate = new Date(inv.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let risk: "low" | "medium" | "high" = "low";
    if (daysUntilDue < 3) risk = "high";
    else if (daysUntilDue < 7) risk = "medium";

    return { ...inv, risk, daysUntilDue };
  });

  const highRiskCount = riskAnalysis.filter(r => r.risk === "high").length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <BrainCircuit size={18} className="text-violet-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Previsão de Atraso (ML)</h3>
      </div>

      <div className="flex-1 space-y-4">
        {highRiskCount > 0 ? (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                <div>
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Risco Crítico</p>
                    <p className="text-sm text-zinc-300">
                        {highRiskCount} fatura{highRiskCount > 1 ? 's têm' : ' tem'} alta probabilidade de atraso nos próximos 3 dias.
                    </p>
                </div>
            </div>
        ) : (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                <div>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Sob Controle</p>
                    <p className="text-sm text-zinc-300">
                        Nenhuma fatura com alto risco de atraso detectada para esta semana.
                    </p>
                </div>
            </div>
        )}

        <div className="pt-4 border-t border-zinc-800 space-y-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monitoramento de Risco</p>
            {riskAnalysis.slice(0, 3).map(inv => (
                <div key={inv.id} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 truncate max-w-[150px]">{inv.name}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full uppercase text-[9px] ${
                        inv.risk === 'high' ? 'bg-rose-500/20 text-rose-500' : 
                        inv.risk === 'medium' ? 'bg-amber-500/20 text-amber-500' : 
                        'bg-emerald-500/20 text-emerald-500'
                    }`}>
                        {inv.risk === 'high' ? 'Crítico' : inv.risk === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                </div>
            ))}
        </div>
      </div>
      
      <p className="mt-6 text-[9px] text-zinc-600 font-mono italic">
        * Algoritmo considera proximidade do vencimento e padrões de categoria.
      </p>
    </div>
  );
}
