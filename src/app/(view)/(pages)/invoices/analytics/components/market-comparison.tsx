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
  Legend,
  Cell
} from "recharts";
import { Scale } from "lucide-react";

interface MarketComparisonProps {
  invoices: InvoiceEntity[];
}

export function MarketComparison({ invoices }: MarketComparisonProps) {
  // Mock market averages for comparison
  const marketBenchmarks: Record<string, number> = {
    "Moradia": 1200,
    "Alimentação": 800,
    "Utilidades": 450,
    "Transporte": 350
  };

  const myAverages = invoices.reduce((acc, inv) => {
    if (marketBenchmarks[inv.category]) {
        acc[inv.category] = (acc[inv.category] || 0) + inv.price.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Divide by 6 for monthly average
  Object.keys(myAverages).forEach(cat => myAverages[cat] /= 6);

  const data = Object.keys(marketBenchmarks).map(cat => ({
    name: cat,
    "Meus Gastos": myAverages[cat] || 0,
    "Média Mercado": marketBenchmarks[cat]
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Scale size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Média de Mercado (Mensal)</h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis hide />
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            <Bar dataKey="Meus Gastos" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Média Mercado" fill="#3f3f46" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-[9px] text-zinc-600 italic text-center">
        * Médias de mercado baseadas em perfil residencial padrão para a região.
      </p>
    </div>
  );
}
