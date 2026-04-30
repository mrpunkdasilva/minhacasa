"use client";

import { useState, useMemo } from "react";
import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { subMonths, isAfter, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  LayoutGrid, 
  Calendar, 
  Filter, 
  ArrowUpCircle,
  Coins,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/app/(view)/components/ui/tabs";
import { IncomeEvolutionChart } from "./components/income-evolution-chart";
import { IncomeCategoryChart } from "./components/income-category-chart";
import { TopIncomeSources } from "./components/top-income-sources";
import { IncomeSeasonality } from "./components/income-seasonality";

interface IncomesAnalyticsViewProps {
  incomes: IncomeEntity[];
}

export function IncomesAnalyticsView({ incomes }: IncomesAnalyticsViewProps) {
  const [range, setRange] = useState("all");

  const filteredIncomes = useMemo(() => {
    if (range === "all") return incomes;
    const months = parseInt(range);
    const cutOffDate = subMonths(new Date(), months);
    return incomes.filter(inc => isAfter(new Date(inc.date), cutOffDate));
  }, [incomes, range]);

  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + inc.amount.amount, 0);
  const monthlyAverage = filteredIncomes.length > 0 ? totalIncome / 6 : 0; // Simple avg

  if (incomes.length === 0) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Análise de Entradas</h1>
        <p className="text-zinc-500">Nenhuma entrada encontrada para análise.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
                Análise de Entradas
            </h1>
            <p className="text-zinc-400">
                Acompanhe o crescimento e a origem dos seus ganhos de forma detalhada.
            </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2 px-3 text-zinc-500">
                <Filter size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Período</span>
            </div>
            <Tabs value={range} onValueChange={setRange}>
                <TabsList variant="line">
                    <TabsTrigger value="3">3 Meses</TabsTrigger>
                    <TabsTrigger value="6">6 Meses</TabsTrigger>
                    <TabsTrigger value="12">1 Ano</TabsTrigger>
                    <TabsTrigger value="all">Tudo</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Receita Total</p>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                    <Coins size={20} />
                </div>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-mono">
                    {totalIncome.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Acumulado no período</p>
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Média Mensal</p>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <TrendingUp size={20} />
                </div>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-mono">
                    {monthlyAverage.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Expectativa mensal</p>
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-violet-500/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Maior Recebimento</p>
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform">
                    <ArrowUpCircle size={20} />
                </div>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-mono">
                    {(filteredIncomes.length > 0 ? Math.max(...filteredIncomes.map(i => i.amount.amount)) : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Pico de entrada</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
            <IncomeEvolutionChart incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-4">
            <IncomeCategoryChart incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-6">
            <TopIncomeSources incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-6">
            <IncomeSeasonality incomes={filteredIncomes} />
        </div>
      </div>
    </div>
  );
}
