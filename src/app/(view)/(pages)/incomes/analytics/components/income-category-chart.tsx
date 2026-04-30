"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface IncomeCategoryChartProps {
  incomes: IncomeEntity[];
}

export function IncomeCategoryChart({ incomes }: IncomeCategoryChartProps) {
  const categoryData = incomes.reduce((acc, inc) => {
    acc[inc.category] = (acc[inc.category] || 0) + inc.amount.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <PieIcon size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Por Categoria</h3>
      </div>

      <div className="h-[250px] w-full">
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
