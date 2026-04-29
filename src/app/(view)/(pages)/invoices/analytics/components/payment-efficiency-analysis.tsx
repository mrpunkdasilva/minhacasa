"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { differenceInDays } from "date-fns";

interface PaymentEfficiencyAnalysisProps {
  invoices: InvoiceEntity[];
}

export function PaymentEfficiencyAnalysis({ invoices }: PaymentEfficiencyAnalysisProps) {
  const paid = invoices.filter(i => i.status === InvoiceStatus.paid);
  
  const stats = paid.reduce((acc, inv) => {
    const diff = differenceInDays(new Date(inv.dueDate), new Date(inv.updatedAt));
    if (diff > 0) acc.early += 1;
    else if (diff === 0) acc.onTime += 1;
    else acc.late += 1;
    return acc;
  }, { early: 0, onTime: 0, late: 0 });

  const data = [
    { name: "Antecipados", value: stats.early, color: "#10b981" },
    { name: "No Prazo", value: stats.onTime, color: "#3b82f6" },
    { name: "Com Atraso", value: stats.late, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const efficiencyScore = paid.length > 0 
    ? ((stats.early + stats.onTime) / paid.length) * 100 
    : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-zinc-400">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Eficiência de Pagamento</h3>
        </div>
        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${efficiencyScore > 90 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
            {efficiencyScore.toFixed(0)}% SCORE
        </span>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", fontSize: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <Clock size={12} className="text-emerald-500 mb-1" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Cedo</span>
            <span className="text-sm font-black text-white">{stats.early}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <CheckCircle2 size={12} className="text-blue-500 mb-1" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Prazo</span>
            <span className="text-sm font-black text-white">{stats.onTime}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
            <AlertCircle size={12} className="text-rose-500 mb-1" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Atraso</span>
            <span className="text-sm font-black text-white">{stats.late}</span>
        </div>
      </div>
    </div>
  );
}
