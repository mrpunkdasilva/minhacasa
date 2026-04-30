"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface IncomeSeasonalityProps {
  incomes: IncomeEntity[];
}

export function IncomeSeasonality({ incomes }: IncomeSeasonalityProps) {
  // Heatmap: Day of Week vs Month
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const matrix = Array.from({ length: 12 }, () => Array(7).fill(0));

  incomes.forEach(inc => {
    const d = new Date(inc.date);
    matrix[d.getMonth()][d.getDay()] += inc.amount.amount;
  });

  const months = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2024, i, 1), "MMM", { locale: ptBR }).toUpperCase()
  );

  const maxVal = Math.max(...matrix.flat()) || 1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Calendar size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Intensidade de Recebimento</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
            <div className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 mb-2">
                <div className=""></div>
                {months.map(m => (
                    <div key={m} className="text-[9px] text-zinc-600 font-bold text-center">{m}</div>
                ))}
            </div>
            
            {days.map((day, dIdx) => (
                <div key={day} className="grid grid-cols-[60px_repeat(12,1fr)] gap-1 mb-1">
                    <div className="text-[10px] text-zinc-500 font-bold flex items-center">{day}</div>
                    {months.map((_, mIdx) => {
                        const val = matrix[mIdx][dIdx];
                        const opacity = val / maxVal;
                        return (
                            <div 
                                key={`${mIdx}-${dIdx}`} 
                                title={val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                className="aspect-square rounded-xs transition-all"
                                style={{ 
                                    backgroundColor: val > 0 ? `rgba(16, 185, 129, ${0.1 + opacity * 0.9})` : '#18181b',
                                    border: val > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #27272a'
                                }}
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
      </div>
      <p className="mt-4 text-[9px] text-zinc-600 italic text-center">
        * Tons mais escuros de verde representam maiores volumes financeiros recebidos.
      </p>
    </div>
  );
}
