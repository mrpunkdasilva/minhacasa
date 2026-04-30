"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { AlertCircle, ShieldCheck, HelpCircle } from "lucide-react";

interface IncomeDependencyAlertProps {
  incomes: IncomeEntity[];
}

export function IncomeDependencyAlert({ incomes }: IncomeDependencyAlertProps) {
  if (incomes.length === 0) return null;

  const total = incomes.reduce((sum, inc) => sum + inc.amount.amount, 0);
  const sourceTotals = incomes.reduce((acc, inc) => {
    acc[inc.name] = (acc[inc.name] || 0) + inc.amount.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedSources = Object.entries(sourceTotals).sort((a, b) => b[1] - a[1]);
  const mainSource = sortedSources[0];
  const dependencyRatio = total > 0 ? (mainSource[1] / total) * 100 : 0;

  const isHighRisk = dependencyRatio > 70;
  const isModerateRisk = dependencyRatio > 40 && dependencyRatio <= 70;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <HelpCircle size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Dependência de Receita</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center text-center">
        <div className={`text-5xl font-black font-mono mb-2 ${isHighRisk ? 'text-rose-500' : isModerateRisk ? 'text-amber-500' : 'text-emerald-500'}`}>
            {dependencyRatio.toFixed(0)}%
        </div>
        <p className="text-xs font-bold text-white uppercase tracking-widest">Concentração na maior fonte</p>
        <p className="text-[11px] text-zinc-500 mt-4 font-medium uppercase tracking-tighter">
            FONTE PRINCIPAL: <span className="text-zinc-300 font-black">{mainSource[0]}</span>
        </p>
      </div>

      <div className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${
        isHighRisk ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
        isModerateRisk ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
        'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      }`}>
        {isHighRisk ? <AlertCircle className="shrink-0" size={18} /> : <ShieldCheck className="shrink-0" size={18} />}
        <div>
            <p className="text-[10px] font-black uppercase mb-1">
                {isHighRisk ? 'Risco Crítico' : isModerateRisk ? 'Atenção Moderada' : 'Fluxo Diversificado'}
            </p>
            <p className="text-[9px] text-zinc-400 leading-tight">
                {isHighRisk 
                    ? "Você depende fortemente de uma única fonte. Tente diversificar seus ganhos para maior segurança." 
                    : isModerateRisk 
                    ? "Sua maior fonte tem um peso considerável. Fique atento a oportunidades de novas receitas." 
                    : "Parabéns! Seus ganhos estão bem distribuídos, reduzindo o impacto de perdas individuais."}
            </p>
        </div>
      </div>
    </div>
  );
}
