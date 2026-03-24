"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyExpensesChartProps {
  invoices: InvoiceEntity[];
}

export function MonthlyExpensesChart({ invoices }: MonthlyExpensesChartProps) {
  // Process invoices to get monthly totals
  const monthlyDataMap = invoices.reduce(
    (acc, inv) => {
      const month = format(new Date(inv.dueDate), "MMM", { locale: ptBR });
      acc[month] = (acc[month] || 0) + inv.price;
      return acc;
    },
    {} as Record<string, number>,
  );

  const data = Object.entries(monthlyDataMap).map(([name, total]) => ({
    name: name.toUpperCase(),
    total,
  }));

  // Sort by month if needed, for now just showing what's in the map

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />
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
            cursor={{ fill: "#27272a", opacity: 0.4 }}
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#10b981" }}
            formatter={(value: number | string | readonly (string | number)[] | undefined) => [
              Number(value || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }),
              "Total",
            ]}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#10b981" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
