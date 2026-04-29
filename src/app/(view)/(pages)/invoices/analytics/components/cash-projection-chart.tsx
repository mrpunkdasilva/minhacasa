"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wallet } from "lucide-react";

interface CashProjectionChartProps {
  invoices: InvoiceEntity[];
}

export function CashProjectionChart({ invoices }: CashProjectionChartProps) {
  // Generate projection for next 6 months
  const now = new Date();
  const projectionMonths = Array.from({ length: 6 }, (_, i) => {
    const date = addMonths(startOfMonth(now), i);
    return {
      date,
      name: format(date, "MMM", { locale: ptBR }).toUpperCase(),
      amount: 0,
    };
  });

  projectionMonths.forEach((month) => {
    const monthStart = month.date;
    const monthEnd = endOfMonth(month.date);

    invoices.forEach((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      
      // If regular invoice in the month
      if (isWithinInterval(dueDate, { start: monthStart, end: monthEnd })) {
        month.amount += invoice.price.amount;
      } 
      // If recurring and applies to this month (simplified logic)
      else if (invoice.recurrence.isRecurring && dueDate < monthStart) {
        // Assume monthly recurrence for now
        month.amount += invoice.price.amount;
      }
    });
  });

  const data = projectionMonths.map(m => ({
    name: m.name,
    amount: m.amount,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <Wallet size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Projeção de Caixa (Próximos 6 meses)</h3>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#71717a", fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#71717a", fontSize: 12 }}
              tickFormatter={(value) => `R$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#18181b", 
                border: "1px solid #27272a", 
                borderRadius: "8px",
                fontSize: "12px"
              }}
              itemStyle={{ color: "#10b981" }}
              formatter={(value: number) => [
                value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                "Saída Prevista"
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorAmount)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
