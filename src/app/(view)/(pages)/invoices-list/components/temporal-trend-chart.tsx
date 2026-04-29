"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TemporalTrendChartProps {
  invoices: InvoiceEntity[];
}

export function TemporalTrendChart({ invoices }: TemporalTrendChartProps) {
  // Sort by due date and aggregate
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );

  const dataMap: Record<string, number> = {};
  let cumulativeTotal = 0;

  sortedInvoices.forEach((inv) => {
    const dateStr = format(new Date(inv.dueDate), "dd/MMM", { locale: ptBR });
    cumulativeTotal += inv.price.amount;
    dataMap[dateStr] = cumulativeTotal;
  });

  const data = Object.entries(dataMap).map(([date, total]) => ({
    date,
    total,
  }));

  return (
    <div className="h-75 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
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
            formatter={(value: number) => [
              Number(value).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }),
              "Acumulado",
            ]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

