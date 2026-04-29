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
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";

interface StatusDistributionChartProps {
  invoices: InvoiceEntity[];
}

const STATUS_COLORS = {
  [InvoiceStatus.paid]: "#10b981",
  [InvoiceStatus.unpaid]: "#f59e0b",
  [InvoiceStatus.overdue]: "#ef4444",
  [InvoiceStatus.scheduled]: "#3b82f6",
};

const STATUS_LABELS = {
  [InvoiceStatus.paid]: "Pago",
  [InvoiceStatus.unpaid]: "Pendente",
  [InvoiceStatus.overdue]: "Atrasado",
  [InvoiceStatus.scheduled]: "Agendado",
};

export function StatusDistributionChart({
  invoices,
}: StatusDistributionChartProps) {
  const statusDataMap = invoices.reduce(
    (acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + inv.price.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const data = Object.entries(statusDataMap).map(([status, total]) => ({
    name: STATUS_LABELS[status as InvoiceStatus],
    total,
    status: status as InvoiceStatus,
  }));

  return (
    <div className="h-75 w-full mt-4">
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
            tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip
            cursor={{ fill: "#27272a", opacity: 0.4 }}
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: number) => [
              Number(value).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }),
              "Total",
            ]}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

