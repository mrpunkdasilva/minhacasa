"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ValueDistributionChartProps {
  invoices: InvoiceEntity[];
}

export function ValueDistributionChart({ invoices }: ValueDistributionChartProps) {
  const ranges = [
    { label: "0-100", min: 0, max: 100 },
    { label: "100-500", min: 100, max: 500 },
    { label: "500-1k", min: 500, max: 1000 },
    { label: "1k-5k", min: 1000, max: 5000 },
    { label: "5k+", min: 5000, max: Infinity },
  ];

  const data = ranges.map(range => ({
    name: range.label,
    count: invoices.filter(inv => inv.price.amount >= range.min && inv.price.amount < range.max).length
  }));

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#71717a", fontSize: 10 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#18181b", 
              border: "1px solid #27272a", 
              borderRadius: "8px",
              fontSize: "12px"
            }}
            cursor={{ fill: "#27272a", opacity: 0.4 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#10b981" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
