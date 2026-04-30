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
import { LineChart as ChartIcon } from "lucide-react";

interface CumulativeBalanceChartProps {
  incomes: IncomeEntity[];
  invoices: InvoiceEntity[];
}

export function CumulativeBalanceChart({ incomes, invoices }: CumulativeBalanceChartProps) {
  let runningBalance = 0;
  const data = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), 11 - i);
    
    const incMonth = incomes
        .filter(inc => {
            const d = new Date(inc.date);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inc) => sum + inc.amount.amount, 0);

    const invMonth = invoices
        .filter(inv => {
            const d = new Date(inv.dueDate);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inv) => sum + inv.price.amount, 0);

    runningBalance += (incMonth - invMonth);

    return {
      name: format(date, "MMM", { locale: ptBR }).toUpperCase(),
      balance: runningBalance
    };
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <ChartIcon size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Crescimento de Patrimônio</h3>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={v => `R$${v}`} />
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Saldo Acumulado"]}
            />
            <Area type="monotone" dataKey="balance" stroke="#10b981" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
