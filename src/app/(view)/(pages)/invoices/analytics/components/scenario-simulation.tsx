"use client";

import { useState } from "react";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Calculator, ArrowRight } from "lucide-react";

interface ScenarioSimulationProps {
  invoices: InvoiceEntity[];
}

export function ScenarioSimulation({ invoices }: ScenarioSimulationProps) {
  const [variation, setVariation] = useState(0); // -50% to +50%
  
  const monthlyTotal = invoices.reduce((sum, inv) => sum + inv.price.amount, 0) / 6; // Average month
  
  const data = Array.from({ length: 6 }, (_, i) => {
    const baseValue = monthlyTotal;
    const simulatedValue = baseValue * (1 + variation / 100);
    return {
        month: `Mês ${i + 1}`,
        base: baseValue,
        simulated: simulatedValue
    };
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Calculator size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Simulação de Cenários</h3>
      </div>

      <div className="space-y-6">
        <div>
            <div className="flex justify-between mb-2">
                <span className="text-xs text-zinc-500 font-bold uppercase">Variação de Gastos</span>
                <span className={`text-xs font-bold ${variation >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {variation > 0 ? '+' : ''}{variation}%
                </span>
            </div>
            <input 
                type="range" 
                min="-50" 
                max="50" 
                value={variation}
                onChange={(e) => setVariation(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between mt-1 text-[10px] text-zinc-600 font-bold uppercase">
                <span>Economia</span>
                <span>Neutro</span>
                <span>Aumento</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30">
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Impacto Mensal</p>
                <p className={`text-lg font-black font-mono ${variation >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {(monthlyTotal * (variation / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30">
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Novo Total Médio</p>
                <p className="text-lg font-black text-white font-mono">
                    {(monthlyTotal * (1 + variation / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
            </div>
        </div>

        <div className="h-[150px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                        formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    />
                    <Area type="monotone" dataKey="base" stroke="#71717a" fill="#71717a" fillOpacity={0.1} strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="simulated" stroke={variation >= 0 ? "#ef4444" : "#10b981"} fill={variation >= 0 ? "#ef4444" : "#10b981"} fillOpacity={0.2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
