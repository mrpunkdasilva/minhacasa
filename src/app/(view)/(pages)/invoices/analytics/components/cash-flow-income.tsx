"use client";

import { useState, useEffect } from "react";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { format, subMonths, addMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wallet2 } from "lucide-react";

interface CashFlowIncomeProps {
  invoices: InvoiceEntity[];
  incomes: IncomeEntity[];
}

export function CashFlowIncome({ invoices, incomes }: CashFlowIncomeProps) {
  // Calculate average real income to use as default simulation value
  const realMonthlyAverage = incomes.length > 0 
    ? incomes.reduce((sum, inc) => sum + inc.amount.amount, 0) / 6 // Average over 6 months
    : 5000;

  const [monthlyIncome, setMonthlyIncome] = useState(realMonthlyAverage);

  // Update simulation value when real data changes (initial load)
  useEffect(() => {
    if (incomes.length > 0) {
        setMonthlyIncome(incomes.reduce((sum, inc) => sum + inc.amount.amount, 0) / 6);
    }
  }, [incomes]);
  
  // Calculate balance for last 6 months using real income data per month
  const now = startOfMonth(new Date());
  const data = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    
    const expensesInMonth = invoices
        .filter(inv => {
            const due = new Date(inv.dueDate);
            return due.getMonth() === date.getMonth() && due.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inv) => sum + inv.price.amount, 0);
    
    const realIncomeInMonth = incomes
        .filter(inc => {
            const d = new Date(inc.date);
            return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        })
        .reduce((sum, inc) => sum + inc.amount.amount, 0);

    // Use simulated monthlyIncome if real data is zero (for projection/empty months)
    const effectiveIncome = realIncomeInMonth || monthlyIncome;
    const balance = effectiveIncome - expensesInMonth;

    return {
        name: format(date, "MMM", { locale: ptBR }).toUpperCase(),
        balance: balance,
        expenses: expensesInMonth,
        income: effectiveIncome
    };
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-zinc-400">
            <Wallet2 size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Fluxo de Caixa Projetado</h3>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Sua Receita:</span>
            <input 
                type="number" 
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono w-24 focus:outline-none focus:border-emerald-500"
            />
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis hide />
            <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", fontSize: "10px" }}
                formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            />
            <ReferenceLine y={0} stroke="#3f3f46" />
            <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? "#10b981" : "#ef4444"} fillOpacity={0.8} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
        <div className="flex items-center gap-2 text-emerald-500">
            <div className="size-2 rounded-full bg-emerald-500"></div>
            <span>Saldo Positivo</span>
        </div>
        <div className="flex items-center gap-2 text-rose-500">
            <div className="size-2 rounded-full bg-rose-500"></div>
            <span>Saldo Negativo</span>
        </div>
      </div>
    </div>
  );
}
