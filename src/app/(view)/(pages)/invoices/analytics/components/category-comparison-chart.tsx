"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
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

interface CategoryComparisonChartProps {
  invoices: InvoiceEntity[];
}

export function CategoryComparisonChart({ invoices }: CategoryComparisonChartProps) {
  const categoryDataMap = invoices.reduce((acc, inv) => {
    const cat = inv.category;
    acc[cat] = (acc[cat] || 0) + inv.price.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryDataMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
          <XAxis 
            type="number" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#71717a", fontSize: 10 }} 
            tickFormatter={(value) => `R$${value}`}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#fff", fontSize: 11, fontWeight: "bold" }}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#18181b", 
              border: "1px solid #27272a", 
              borderRadius: "8px",
              fontSize: "12px"
            }}
            cursor={{ fill: "#27272a", opacity: 0.4 }}
            formatter={(value: number) => [
              value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              "Total"
            ]}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
