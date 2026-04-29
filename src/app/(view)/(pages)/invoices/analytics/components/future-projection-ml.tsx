"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { format, subMonths, addMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BrainCircuit } from "lucide-react";

interface FutureProjectionMLProps {
  invoices: invoices[];
}

export function FutureProjectionML({ invoices }: FutureProjectionMLProps) {
  // Generate historical data for last 6 months + 3 projection months
  const now = startOfMonth(new Date());
  
  const data = Array.from({ length: 9 }, (_, i) => {
    const date = addMonths(subMonths(now, 5), i);
    const isFuture = i > 5;
    
    // Calculate total for this month if in past
    let amount = 0;
    if (!isFuture) {
        amount = invoices
            .filter(inv => {
                const due = new Date(inv.dueDate);
                return due.getMonth() === date.getMonth() && due.getFullYear() === date.getFullYear();
            })
            .reduce((sum, inv) => sum + inv.price.amount, 0);
    }

    return {
      name: format(date, "MMM", { locale: ptBR }).toUpperCase(),
      amount: amount || null,
      projection: null as number | null,
      isFuture
    };
  });

  // Simple ML: Linear Trend based on non-zero historical months
  const historical = data.filter(d => d.amount !== null && d.amount > 0);
  if (historical.length >= 2) {
    const n = historical.length;
    const xSum = historical.reduce((s, _, i) => s + i, 0);
    const ySum = historical.reduce((s, d) => s + (d.amount || 0), 0);
    const xySum = historical.reduce((s, d, i) => s + (i * (d.amount || 0)), 0);
    const xSqSum = historical.reduce((s, _, i) => s + (i * i), 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * xSqSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    data.forEach((d, i) => {
        if (i >= 5) {
            d.projection = Math.max(0, slope * i + intercept);
        } else if (i === 5) {
            d.projection = d.amount; // Connect lines
        }
    });
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <BrainCircuit size={18} className="text-violet-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Projeção Preditiva (ML)</h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
              formatter={(value: number) => [
                value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                "Valor"
              ]}
            />
            <ReferenceLine x={data[5].name} stroke="#3f3f46" strokeDasharray="3 3" label={{ position: 'top', value: 'HOJE', fill: '#52525b', fontSize: 10 }} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "#10b981" }} 
              connectNulls
            />
            <Line 
              type="monotone" 
              dataKey="projection" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={{ r: 3, fill: "#8b5cf6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
        <div className="flex items-center gap-2 text-emerald-500">
            <div className="size-2 rounded-full bg-emerald-500"></div>
            <span>Histórico Real</span>
        </div>
        <div className="flex items-center gap-2 text-violet-500">
            <div className="size-2 rounded-full bg-violet-500"></div>
            <span>Tendência ML</span>
        </div>
      </div>
    </div>
  );
}
