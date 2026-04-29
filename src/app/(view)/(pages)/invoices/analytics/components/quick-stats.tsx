"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { TrendingUp, CreditCard, ArrowUpCircle, Target } from "lucide-react";

interface QuickStatsProps {
  invoices: InvoiceEntity[];
}

export function QuickStats({ invoices }: QuickStatsProps) {
  const total = invoices.reduce((sum, inv) => sum + inv.price.amount, 0);
  const average = invoices.length > 0 ? total / invoices.length : 0;
  const max = invoices.length > 0 ? Math.max(...invoices.map(i => i.price.amount)) : 0;
  
  // Simple "efficiency" score based on overdue vs total
  const overdueCount = invoices.filter(i => i.status === 2).length; // InvoiceStatus.overdue
  const efficiency = invoices.length > 0 
    ? Math.max(0, 100 - (overdueCount / invoices.length) * 100)
    : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Volume Total" 
        value={total} 
        icon={<CreditCard size={16} />} 
        description="Soma de todos os lançamentos"
        color="emerald"
      />
      <StatCard 
        title="Ticket Médio" 
        value={average} 
        icon={<Target size={16} />} 
        description="Valor médio por fatura"
        color="blue"
      />
      <StatCard 
        title="Maior Lançamento" 
        value={max} 
        icon={<ArrowUpCircle size={16} />} 
        description="Pico de despesa no período"
        color="rose"
      />
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Saúde de Pagamento</p>
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
                <TrendingUp size={16} />
            </div>
        </div>
        <div className="flex items-end gap-2">
            <p className="text-2xl font-black text-white font-mono">{efficiency.toFixed(0)}%</p>
            <p className="text-[10px] text-zinc-500 font-bold mb-1 uppercase">Eficiência</p>
        </div>
        <div className="mt-3 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
                className="h-full bg-violet-500 transition-all duration-1000" 
                style={{ width: `${efficiency}%` }}
            ></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description, color }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    description: string;
    color: 'emerald' | 'blue' | 'rose';
}) {
  const colors = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:bg-zinc-800/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
        <div className={`p-1.5 rounded-lg ${colors[color].split(' ').slice(0, 2).join(' ')}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-white font-mono">
          {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
        <p className="text-[10px] text-zinc-500 font-medium mt-1 uppercase tracking-tight">{description}</p>
      </div>
    </div>
  );
}
