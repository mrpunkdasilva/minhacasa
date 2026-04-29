"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SeasonalityHeatmapProps {
  invoices: InvoiceEntity[];
}

export function SeasonalityHeatmap({ invoices }: SeasonalityHeatmapProps) {
  // Days of week 0-6
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const matrix = Array.from({ length: 12 }, () => Array(7).fill(0));

  invoices.forEach(inv => {
    const date = new Date(inv.dueDate);
    const month = date.getMonth();
    const day = date.getDay();
    matrix[month][day] += 1;
  });

  const months = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2024, i, 1), "MMM", { locale: ptBR }).toUpperCase()
  );

  const maxVal = Math.max(...matrix.flat()) || 1;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[80px_repeat(12,1fr)] gap-2 mb-2">
            <div className=""></div>
            {months.map(m => (
                <div key={m} className="text-[10px] text-zinc-500 font-bold text-center uppercase">{m}</div>
            ))}
        </div>
        
        {days.map((day, dIdx) => (
            <div key={day} className="grid grid-cols-[80px_repeat(12,1fr)] gap-2 mb-2">
                <div className="text-[10px] text-zinc-400 font-bold flex items-center">{day}</div>
                {months.map((_, mIdx) => {
                    const val = matrix[mIdx][dIdx];
                    const opacity = val / maxVal;
                    return (
                        <div 
                            key={`${mIdx}-${dIdx}`} 
                            title={`${val} vencimentos`}
                            className="aspect-square rounded-sm transition-all"
                            style={{ 
                                backgroundColor: val > 0 ? `rgba(16, 185, 129, ${0.1 + opacity * 0.9})` : '#27272a',
                                border: val > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                            }}
                        ></div>
                    );
                })}
            </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <span className="text-[10px] text-zinc-500 font-bold uppercase">Menos</span>
        <div className="flex gap-1">
            <div className="size-3 bg-zinc-800 rounded-sm"></div>
            <div className="size-3 bg-emerald-500/30 rounded-sm"></div>
            <div className="size-3 bg-emerald-500/60 rounded-sm"></div>
            <div className="size-3 bg-emerald-500 rounded-sm"></div>
        </div>
        <span className="text-[10px] text-zinc-500 font-bold uppercase">Mais</span>
      </div>
    </div>
  );
}
