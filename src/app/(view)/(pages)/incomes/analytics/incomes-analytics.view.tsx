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
  ArrowRight,
  Landmark,
  ShieldCheck,
  Target,
  Plane,
  ShieldAlert,
  Repeat,
  LineChart as ChartIcon,
  CalendarDays,
  Zap,
  Search
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/app/(view)/components/ui/tabs";
import { IncomeEvolutionChart } from "./components/income-evolution-chart";
import { IncomeCategoryChart } from "./components/income-category-chart";
import { TopIncomeSources } from "./components/top-income-sources";
import { IncomeSeasonality } from "./components/income-seasonality";
import { IncomeFutureProjectionML } from "./components/income-future-projection-ml";
import { IncomeGrowthChart } from "./components/income-growth-chart";
import { IncomeVolatilityIndex } from "./components/income-volatility-index";
import { IncomeDependencyAlert } from "./components/income-dependency-alert";
import { NetMarginAnalysis } from "./components/net-margin-analysis";
import { SavingsRateTrend } from "./components/savings-rate-trend";
import { ExpenseCoverageRatio } from "./components/expense-coverage-ratio";
import { IncomeWeekdayDistribution } from "./components/income-weekday-distribution";
import { IncomeOutliers } from "./components/income-outliers";
import { IncomeParetoAnalysis } from "./components/income-pareto-analysis";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";

// New Advanced Components
import { IncomeRecurrenceChart } from "./components/income-recurrence-chart";
import { FinancialRunwayMetric } from "./components/financial-runway-metric";
import { CumulativeBalanceChart } from "./components/cumulative-balance-chart";
import { IncomeGoalTracker } from "./components/income-goal-tracker";
import { PredictiveReceiveWindow } from "./components/predictive-receive-window";
import { IncomeEmergencyBuffer } from "./components/income-emergency-buffer";

interface IncomesAnalyticsViewProps {
  incomes: IncomeEntity[];
  invoices: InvoiceEntity[];
}

export function IncomesAnalyticsView({ incomes, invoices }: IncomesAnalyticsViewProps) {
  const [range, setRange] = useState("all");

  const filteredIncomes = useMemo(() => {
    if (range === "all") return incomes;
    const months = parseInt(range);
    const cutOffDate = subMonths(new Date(), months);
    return incomes.filter(inc => isAfter(new Date(inc.date), cutOffDate));
  }, [incomes, range]);

  const filteredInvoices = useMemo(() => {
    if (range === "all") return invoices;
    const months = parseInt(range);
    const cutOffDate = subMonths(new Date(), months);
    return invoices.filter(inv => isAfter(new Date(inv.dueDate), cutOffDate));
  }, [invoices, range]);

  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + inc.amount.amount, 0);
  const monthlyAverage = filteredIncomes.length > 0 ? totalIncome / 6 : 0;

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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
                Análise de Entradas
            </h1>
            <p className="text-zinc-400">
                Gestão estratégica de receitas, crescimento e sustentabilidade financeira.
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

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <SummaryMetricCard title="Receita Total" value={totalIncome} icon={<Coins size={20} />} subtitle="Acumulado" color="emerald" />
        <SummaryMetricCard title="Média Mensal" value={monthlyAverage} icon={<TrendingUp size={20} />} subtitle="Expectativa" color="blue" />
        <SummaryMetricCard title="Maior Pico" value={Math.max(...filteredIncomes.map(i => i.amount.amount), 0)} icon={<ArrowUpCircle size={20} />} subtitle="Recorde" color="violet" />
      </div>

      {/* 1. Estratégia e Crescimento */}
      <SectionTitle title="Patrimônio e Crescimento" icon={<ChartIcon className="text-emerald-500" />} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-8">
            <CumulativeBalanceChart incomes={filteredIncomes} invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <IncomeGoalTracker incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-4">
            <IncomeGrowthChart incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-8">
            <IncomeFutureProjectionML incomes={filteredIncomes} />
        </div>
      </div>

      {/* 2. Segurança e Sustentabilidade */}
      <SectionTitle title="Segurança e Sustentabilidade" icon={<Landmark className="text-blue-500" />} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-4">
            <FinancialRunwayMetric incomes={filteredIncomes} invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <IncomeEmergencyBuffer incomes={filteredIncomes} invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <ExpenseCoverageRatio incomes={filteredIncomes} invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <NetMarginAnalysis incomes={filteredIncomes} invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <SavingsRateTrend incomes={filteredIncomes} invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <IncomeVolatilityIndex incomes={filteredIncomes} />
        </div>
      </div>

      {/* 3. Distribuição e Riscos */}
      <SectionTitle title="Distribuição e Riscos" icon={<LayoutGrid className="text-amber-500" />} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-4">
            <IncomeRecurrenceChart incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-8">
            <IncomeParetoAnalysis incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-4">
            <IncomeDependencyAlert incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-8">
            <IncomeEvolutionChart incomes={filteredIncomes} />
        </div>
      </div>

      {/* 4. Padrões e Sazonalidade */}
      <SectionTitle title="Padrões e Sazonalidade" icon={<Calendar className="text-violet-500" />} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-4">
            <PredictiveReceiveWindow incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-8">
            <IncomeSeasonality incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-6">
            <IncomeWeekdayDistribution incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-6">
            <IncomeOutliers incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-12">
            <TopIncomeSources incomes={filteredIncomes} />
        </div>
        <div className="lg:col-span-12">
            <IncomeCategoryChart incomes={filteredIncomes} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, icon }: { title: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-2">
            {icon}
            <h2 className="text-lg font-black uppercase tracking-tighter text-white">{title}</h2>
        </div>
    );
}

function SummaryMetricCard({ title, value, icon, subtitle, color }: { title: string; value: number; icon: React.ReactNode; subtitle: string; color: 'emerald' | 'blue' | 'violet' }) {
    const colorClasses = {
        emerald: "bg-emerald-500/10 text-emerald-500 hover:border-emerald-500/30",
        blue: "bg-blue-500/10 text-blue-500 hover:border-blue-500/30",
        violet: "bg-violet-500/10 text-violet-500 hover:border-violet-500/30"
    };
    return (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-all group ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-4">
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{title}</p>
                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-3xl font-black text-white font-mono">
                    {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">{subtitle}</p>
            </div>
        </div>
    );
}
