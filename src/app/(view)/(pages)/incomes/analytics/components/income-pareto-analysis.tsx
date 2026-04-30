"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Line, ComposedChart } from "recharts";
import { Target } from "lucide-react";

interface IncomeParetoAnalysisProps {
  incomes: IncomeEntity[];
}

export function IncomeParetoAnalysis({ incomes }: IncomeParetoAnalysisProps) {
  const sourceTotals = incomes.reduce((acc, inc) => {
    acc[inc.name] = (acc[inc.name] || 0) + inc.amount.amount;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(sourceTotals).reduce((a, b) => a + b, 0);
  
  const sortedData = Object.entries(sourceTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  let cumulativeSum = 0;
  const data = sortedData.map(d => {
    cumulativeSum += d.value;
    return {
      ...d,
      cumulative: (cumulativeSum / total) * 100
    };
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Target size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Análise de Pareto (80/20)</h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 9 }} />
            <YAxis hide />
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number, name: string) => [
                    name === 'cumulative' ? `${value.toFixed(1)}%` : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                    name === 'cumulative' ? 'Acumulado' : 'Valor'
                ]}
            />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.6} />
            <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-[9px] text-zinc-600 italic text-center uppercase font-bold tracking-widest">
        A linha mostra o impacto acumulado das suas fontes de receita.
      </p>
    </div>
  );
}
