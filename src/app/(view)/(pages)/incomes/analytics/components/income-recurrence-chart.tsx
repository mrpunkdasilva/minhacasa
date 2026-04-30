"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Repeat } from "lucide-react";

interface IncomeRecurrenceChartProps {
  incomes: IncomeEntity[];
}

export function IncomeRecurrenceChart({ incomes }: IncomeRecurrenceChartProps) {
  const recurring = incomes
    .filter(i => i.recurrence.isRecurring)
    .reduce((sum, i) => sum + i.amount.amount, 0);
  
  const variable = incomes
    .filter(i => !i.recurrence.isRecurring)
    .reduce((sum, i) => sum + i.amount.amount, 0);

  const data = [
    { name: "Renda Fixa/Recorrente", value: recurring, color: "#10b981" },
    { name: "Renda Variável/Extra", value: variable, color: "#3b82f6" },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Repeat size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Recorrência de Ganhos</h3>
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
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
