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
  Cell,
  ReferenceLine
} from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IncomeGrowthChartProps {
  incomes: IncomeEntity[];
}

export function IncomeGrowthChart({ incomes }: IncomeGrowthChartProps) {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), 5 - i);
    const amount = incomes
        .filter(inc => {
            const d = new Date(inc.date);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inc) => sum + inc.amount.amount, 0);

    return { date, name: format(date, "MMM", { locale: ptBR }).toUpperCase(), amount };
  });

  const growthData = last6Months.map((d, i) => {
    const prev = last6Months[i - 1]?.amount || 0;
    const growth = prev > 0 ? ((d.amount - prev) / prev) * 100 : 0;
    return { ...d, growth };
  }).slice(1); // Remove first month as there's no previous to compare

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <TrendingUp size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Crescimento Mensal (%)</h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={v => `${v}%`} />
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Variação"]}
            />
            <ReferenceLine y={0} stroke="#3f3f46" />
            <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
                {growthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.growth >= 0 ? "#10b981" : "#ef4444"} fillOpacity={0.8} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
