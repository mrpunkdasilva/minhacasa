"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";
import { format, subMonths, addMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BrainCircuit } from "lucide-react";

interface IncomeFutureProjectionMLProps {
  incomes: IncomeEntity[];
}

export function IncomeFutureProjectionML({ incomes }: IncomeFutureProjectionMLProps) {
  const now = startOfMonth(new Date());
  
  const data = Array.from({ length: 9 }, (_, i) => {
    const date = addMonths(subMonths(now, 5), i);
    const isFuture = i > 5;
    
    let amount = 0;
    if (!isFuture) {
        amount = incomes
            .filter(inc => {
                const d = new Date(inc.date);
                return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
            })
            .reduce((sum, inc) => sum + inc.amount.amount, 0);
    }

    return {
      name: format(date, "MMM", { locale: ptBR }).toUpperCase(),
      amount: amount || null,
      projection: null as number | null,
      isFuture
    };
  });

  const historical = data.filter(d => d.amount !== null && d.amount > 0);
  if (historical.length >= 2) {
    const n = historical.length;
    const xSum = historical.reduce((s, _, i) => s + i, 0);
    const ySum = historical.reduce((s, d) => s + (d.amount || 0), 0);
    const xySum = historical.reduce((s, d, i) => s + (i * (d.amount || 0)), 0);
    const xSqSum = historical.reduce((s, _, i) => s + (i * i), 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * xSqSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    data.forEach((d, i) => {
        if (i >= 5) {
            d.projection = Math.max(0, slope * i + intercept);
        } else if (i === 5) {
            d.projection = d.amount;
        }
    });
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <BrainCircuit size={18} className="text-violet-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Expectativa de Ganhos (ML)</h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis hide />
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Projeção"]}
            />
            <ReferenceLine x={data[5].name} stroke="#3f3f46" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="projection" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorProj)" />
            <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-emerald-500">Histórico</span>
        <span className="text-violet-500">Previsão</span>
      </div>
    </div>
  );
}
