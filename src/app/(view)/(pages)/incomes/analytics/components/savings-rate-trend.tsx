"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PiggyBank } from "lucide-react";

interface SavingsRateTrendProps {
  incomes: IncomeEntity[];
  invoices: InvoiceEntity[];
}

export function SavingsRateTrend({ incomes, invoices }: SavingsRateTrendProps) {
  const data = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), 5 - i);
    
    const incAmount = incomes
        .filter(inc => {
            const d = new Date(inc.date);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inc) => sum + inc.amount.amount, 0);

    const invAmount = invoices
        .filter(inv => {
            const d = new Date(inv.dueDate);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inv) => sum + inv.price.amount, 0);

    const rate = incAmount > 0 ? ((incAmount - invAmount) / incAmount) * 100 : 0;

    return {
      name: format(date, "MMM", { locale: ptBR }).toUpperCase(),
      rate: Math.max(0, rate)
    };
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <PiggyBank size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Taxa de Poupança (%)</h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={v => `${v}%`} />
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Economia"]}
            />
            <Area type="monotone" dataKey="rate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-[10px] text-zinc-500 italic text-center">
        * Porcentagem da receita que não foi consumida por despesas.
      </p>
    </div>
  );
}
