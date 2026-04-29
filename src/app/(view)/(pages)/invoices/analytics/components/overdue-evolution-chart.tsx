"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OverdueEvolutionChartProps {
  invoices: InvoiceEntity[];
}

export function OverdueEvolutionChart({ invoices }: OverdueEvolutionChartProps) {
  // Evolution of overdue invoices over the last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), 5 - i);
    return {
      date,
      name: format(date, "MMM", { locale: ptBR }).toUpperCase(),
      count: 0,
      amount: 0,
    };
  });

  last6Months.forEach((month) => {
    const monthStart = month.date;
    const monthEnd = endOfMonth(month.date);

    invoices.forEach((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      if (
        isWithinInterval(dueDate, { start: monthStart, end: monthEnd }) &&
        invoice.status === InvoiceStatus.overdue
      ) {
        month.count += 1;
        month.amount += invoice.price.amount;
      }
    });
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={last6Months}>
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
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#18181b", 
              border: "1px solid #27272a", 
              borderRadius: "8px",
              fontSize: "12px"
            }}
            itemStyle={{ color: "#ef4444" }}
            formatter={(value: number) => [
              value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              "Valor em Atraso"
            ]}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: "#ef4444", r: 4 }}
            activeDot={{ r: 6, stroke: "#18181b", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
