"use client";

import { useState } from "react";
import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { Target, Trophy, ArrowRight } from "lucide-react";

interface IncomeGoalTrackerProps {
  incomes: IncomeEntity[];
}

export function IncomeGoalTracker({ incomes }: IncomeGoalTrackerProps) {
  const [goal, setGoal] = useState(10000);
  
  const currentMonthIncome = incomes
    .filter(inc => {
        const d = new Date(inc.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inc) => sum + inc.amount.amount, 0);

  const progress = Math.min(100, (currentMonthIncome / goal) * 100);
  const isReached = progress >= 100;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-zinc-400">
            <Target size={18} className="text-violet-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Rastreador de Metas</h3>
        </div>
        {isReached && <Trophy size={18} className="text-amber-500 animate-bounce" />}
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-center">
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Sua Meta Mensal</span>
                <span className="text-xs font-black text-white font-mono">{goal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <input 
                type="range" 
                min="1000" 
                max="50000" 
                step="500"
                value={goal}
                onChange={(e) => setGoal(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
        </div>

        <div className="relative pt-8 pb-4">
            <div className="flex items-end justify-between mb-2">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Progresso Atual</p>
                    <p className="text-2xl font-black text-white font-mono">
                        {currentMonthIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                </div>
                <p className={`text-xl font-black font-mono ${isReached ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {progress.toFixed(0)}%
                </p>
            </div>
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                <div 
                    className={`h-full transition-all duration-1000 rounded-full ${isReached ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-violet-500'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      </div>

      {!isReached ? (
        <div className="mt-6 flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Faltam para a meta</span>
            <div className="flex items-center gap-1 text-emerald-500 font-black font-mono text-xs">
                {(goal - currentMonthIncome).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                <ArrowRight size={12} />
            </div>
        </div>
      ) : (
        <div className="mt-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Meta Superada! Parabéns!</p>
        </div>
      )}
    </div>
  );
}
