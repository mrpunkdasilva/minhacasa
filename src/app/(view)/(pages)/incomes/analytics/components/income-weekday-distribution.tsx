"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { CalendarDays } from "lucide-react";

interface IncomeWeekdayDistributionProps {
  incomes: IncomeEntity[];
}

export function IncomeWeekdayDistribution({ incomes }: IncomeWeekdayDistributionProps) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const distribution = Array(7).fill(0);

  incomes.forEach(inc => {
    const d = new Date(inc.date);
    distribution[d.getDay()] += inc.amount.amount;
  });

  const data = days.map((day, i) => ({
    name: day,
    amount: distribution[i]
  }));

  const maxVal = Math.max(...distribution);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <CalendarDays size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Ganhos por Dia da Semana</h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis hide />
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Total"]}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount === maxVal ? "#10b981" : "#3f3f46"} fillOpacity={0.8} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-[10px] text-zinc-500 italic text-center">
        * Mostra em quais dias da semana sua receita costuma cair na conta.
      </p>
    </div>
  );
}
