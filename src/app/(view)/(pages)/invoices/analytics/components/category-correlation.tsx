"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Network } from "lucide-react";

interface CategoryCorrelationProps {
  invoices: InvoiceEntity[];
}

export function CategoryCorrelation({ invoices }: CategoryCorrelationProps) {
  // We'll correlate Moradia vs Utilidades as a default interesting pair
  // Group by month
  const monthlyData = invoices.reduce((acc, inv) => {
    const month = new Date(inv.dueDate).getMonth();
    if (!acc[month]) acc[month] = { Moradia: 0, Utilidades: 0, Alimentação: 0 };
    if (inv.category === "Moradia") acc[month].Moradia += inv.price.amount;
    if (inv.category === "Utilidades") acc[month].Utilidades += inv.price.amount;
    if (inv.category === "Alimentação") acc[month].Alimentação += inv.price.amount;
    return acc;
  }, {} as Record<number, { Moradia: number, Utilidades: number, Alimentação: number }>);

  const data = Object.values(monthlyData).map(d => ({
    x: d.Moradia,
    y: d.Utilidades,
    z: d.Alimentação / 10 // Size based on food spending
  })).filter(d => d.x > 0 || d.y > 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Network size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Correlação: Moradia vs Utilidades</h3>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
                type="number" 
                dataKey="x" 
                name="Moradia" 
                unit="R$" 
                axisLine={false} 
                tick={{ fill: "#71717a", fontSize: 10 }} 
            />
            <YAxis 
                type="number" 
                dataKey="y" 
                name="Utilidades" 
                unit="R$" 
                axisLine={false} 
                tick={{ fill: "#71717a", fontSize: 10 }} 
            />
            <ZAxis type="number" dataKey="z" range={[50, 400]} name="Alimentação" />
            <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
            />
            <Scatter name="Meses" data={data} fill="#10b981" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-[10px] text-zinc-500 leading-relaxed text-center italic">
        Cada ponto representa um mês. O tamanho do ponto indica o volume de gastos com Alimentação.
      </p>
    </div>
  );
}
