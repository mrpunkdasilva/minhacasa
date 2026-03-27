"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";

interface CategoryDistributionChartProps {
  invoices: InvoiceEntity[];
}

const COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
];

export function CategoryDistributionChart({
  invoices,
}: CategoryDistributionChartProps) {
  // Process invoices to get category totals
  const categoryDataMap = invoices.reduce(
    (acc, inv) => {
      acc[inv.category] = (acc[inv.category] || 0) + inv.price;
      return acc;
    },
    {} as Record<string, number>,
  );

  const data = Object.entries(categoryDataMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#fff" }}
            formatter={(
              value: number | string | readonly (string | number)[] | undefined,
            ) => [
              Number(value || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }),
              "Gasto",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: "10px", color: "#71717a" }}
            verticalAlign="bottom"
            align="center"
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
