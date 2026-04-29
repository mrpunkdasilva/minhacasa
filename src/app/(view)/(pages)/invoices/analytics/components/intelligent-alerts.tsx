"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Zap, AlertCircle, BellRing, TrendingUp } from "lucide-react";

interface IntelligentAlertsProps {
  invoices: InvoiceEntity[];
}

export function IntelligentAlerts({ invoices }: IntelligentAlertsProps) {
  const alerts = [];

  // Check for upcoming high-value unpaid invoices
  const highValueUnpaid = invoices.filter(i => 
    i.status === InvoiceStatus.unpaid && i.price.amount > 1000
  );
  if (highValueUnpaid.length > 0) {
    alerts.push({
        id: 'high-value',
        title: 'Atenção: Valores Altos',
        desc: `Você tem ${highValueUnpaid.length} fatura(s) acima de R$ 1.000 pendentes.`,
        type: 'critical',
        icon: <AlertCircle className="size-4" />
    });
  }

  // Check for category spikes (Utilities > 500)
  const utilitySpike = invoices.filter(i => i.category === "Utilidades" && i.price.amount > 500);
  if (utilitySpike.length > 0) {
    alerts.push({
        id: 'util-spike',
        title: 'Pico de Utilidades',
        desc: 'Seus gastos com serviços básicos ultrapassaram R$ 500 este mês.',
        type: 'warning',
        icon: <TrendingUp className="size-4" />
    });
  }

  // Check for overdue (already in other analysis but good for quick alert)
  const overdue = invoices.filter(i => i.status === InvoiceStatus.overdue);
  if (overdue.length > 0) {
    alerts.push({
        id: 'overdue',
        title: 'Faturas em Atraso',
        desc: `Existem ${overdue.length} contas vencidas aguardando pagamento.`,
        type: 'critical',
        icon: <Zap className="size-4" />
    });
  }

  if (alerts.length === 0) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-60">
        <BellRing size={24} className="text-zinc-500 mb-2" />
        <p className="text-xs font-bold text-white uppercase">Tudo em Ordem</p>
        <p className="text-[10px] text-zinc-500">Nenhum alerta crítico para o momento.</p>
    </div>
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <BellRing size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Alertas Inteligentes</h3>
      </div>

      <div className="space-y-3">
        {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-lg border flex gap-3 ${
                alert.type === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            }`}>
                <div className="mt-0.5">{alert.icon}</div>
                <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-0.5">{alert.title}</p>
                    <p className="text-[11px] text-zinc-300 leading-tight">{alert.desc}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
