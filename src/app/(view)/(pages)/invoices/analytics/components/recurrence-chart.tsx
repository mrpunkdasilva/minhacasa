"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface RecurrenceChartProps {
  invoices: InvoiceEntity[];
}

export function RecurrenceChart({ invoices }: RecurrenceChartProps) {
  const recurringAmount = invoices
    .filter((inv) => inv.recurrence.isRecurring)
    .reduce((sum, inv) => sum + inv.price.amount, 0);
  
  const nonRecurringAmount = invoices
    .filter((inv) => !inv.recurrence.isRecurring)
    .reduce((sum, inv) => sum + inv.price.amount, 0);

  const data = [
    { name: "Recorrentes", value: recurringAmount, color: "#10b981" },
    { name: "Eventuais", value: nonRecurringAmount, color: "#71717a" },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#18181b", 
              border: "1px solid #27272a", 
              borderRadius: "8px",
              fontSize: "12px"
            }}
            formatter={(value: number) => [
              value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              "Total"
            ]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
