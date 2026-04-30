"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { Sparkles, CalendarDays, ArrowRight } from "lucide-react";

interface PredictiveReceiveWindowProps {
  incomes: IncomeEntity[];
}

export function PredictiveReceiveWindow({ incomes }: IncomeEntity[]) {
  // Find which day of the month has most income volume
  const dayCounts = Array(31).fill(0);
  incomes.forEach(inc => {
    const day = new Date(inc.date).getDate();
    dayCounts[day - 1] += inc.amount.amount;
  });

  const bestDay = dayCounts.indexOf(Math.max(...dayCounts)) + 1;
  
  // Find best week (approximate)
  const week1 = dayCounts.slice(0, 7).reduce((a, b) => a + b, 0);
  const week2 = dayCounts.slice(7, 14).reduce((a, b) => a + b, 0);
  const week3 = dayCounts.slice(14, 21).reduce((a, b) => a + b, 0);
  const week4 = dayCounts.slice(21).reduce((a, b) => a + b, 0);
  
  const bestWeek = [week1, week2, week3, week4].indexOf(Math.max(week1, week2, week3, week4)) + 1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Sparkles size={18} className="text-amber-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Janela de Recebimento</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/30">
            <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Dia de Maior Fluxo</p>
                <p className="text-3xl font-black text-white font-mono">DIA {bestDay}</p>
            </div>
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
                <CalendarDays size={24} />
            </div>
        </div>

        <div className="space-y-3">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center">Concentração Semanal</p>
            <div className="flex gap-1 h-2">
                {[week1, week2, week3, week4].map((w, i) => (
                    <div 
                        key={i} 
                        className={`flex-1 rounded-full transition-all duration-1000 ${bestWeek === i + 1 ? 'bg-amber-500' : 'bg-zinc-800'}`}
                        style={{ opacity: 0.3 + (w / Math.max(week1, week2, week3, week4)) * 0.7 }}
                    ></div>
                ))}
            </div>
            <div className="flex justify-between text-[8px] text-zinc-600 font-bold uppercase">
                <span>Sem 1</span>
                <span>Sem 2</span>
                <span>Sem 3</span>
                <span>Sem 4</span>
            </div>
        </div>
      </div>

      <p className="mt-6 text-[9px] text-zinc-500 italic leading-relaxed">
        * Baseado em dados históricos, sua melhor janela para planejar pagamentos é por volta da <span className="text-zinc-300 font-bold">Semana {bestWeek}</span>.
      </p>
    </div>
  );
}
