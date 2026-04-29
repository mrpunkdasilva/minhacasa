"use client";

import { useState, useMemo } from "react";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { subMonths, isAfter } from "date-fns";
import { 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  PieChart as PieChartIcon, 
  ArrowUpRight,
  Clock,
  LayoutGrid,
  Zap,
  Filter,
  BrainCircuit,
  Calculator,
  Search,
  Network,
  Scale,
  BellRing,
  Wallet2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/app/(view)/components/ui/tabs";
import { QuickStats } from "./components/quick-stats";
import { RecurrenceChart } from "./components/recurrence-chart";
import { CashProjectionChart } from "./components/cash-projection-chart";
import { ConcentrationAlerts } from "./components/concentration-alerts";
import { OverdueEvolutionChart } from "./components/overdue-evolution-chart";
import { CategoryComparisonChart } from "./components/category-comparison-chart";
import { AveragePaymentTime } from "./components/average-payment-time";
import { OverduePrediction } from "./components/overdue-prediction";
import { SeasonalityHeatmap } from "./components/seasonality-heatmap";
import { ValueDistributionChart } from "./components/value-distribution-chart";
import { ProviderRanking } from "./components/provider-ranking";

// New Components
import { ScenarioSimulation } from "./components/scenario-simulation";
import { FutureProjectionML } from "./components/future-projection-ml";
import { PaymentEfficiencyAnalysis } from "./components/payment-efficiency-analysis";
import { OutliersAnalysis } from "./components/outliers-analysis";
import { CategoryCorrelation } from "./components/category-correlation";
import { MarketComparison } from "./components/market-comparison";
import { IntelligentAlerts } from "./components/intelligent-alerts";
import { CashFlowIncome } from "./components/cash-flow-income";

interface AnalyticsViewProps {
  invoices: InvoiceEntity[];
}

export function AnalyticsView({ invoices }: AnalyticsViewProps) {
  const [range, setRange] = useState("all");

  const filteredInvoices = useMemo(() => {
    if (range === "all") return invoices;
    const months = parseInt(range);
    const cutOffDate = subMonths(new Date(), months);
    return invoices.filter(inv => isAfter(new Date(inv.dueDate), cutOffDate));
  }, [invoices, range]);

  if (invoices.length === 0) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Análise de Faturas</h1>
        <p className="text-zinc-500">Nenhuma fatura encontrada para análise.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
                Análise de Faturas
            </h1>
            <p className="text-zinc-400">
                Central de inteligência para gestão, previsões e insights profundos.
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

      <QuickStats invoices={filteredInvoices} />

      {/* 1. Projeções e Futuro */}
      <SectionTitle title="Projeções e Simulações" icon={<BrainCircuit className="text-violet-500" />} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-8">
            <CashFlowIncome invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <FutureProjectionML invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <ScenarioSimulation invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-8">
            <CashProjectionChart invoices={filteredInvoices} />
        </div>
      </div>

      {/* 2. Riscos e Eficiência */}
      <SectionTitle title="Riscos e Performance" icon={<Zap className="text-amber-500" />} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-4">
            <IntelligentAlerts invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <OverduePrediction invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <PaymentEfficiencyAnalysis invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-6">
            <OutliersAnalysis invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full hover:border-zinc-700/50 transition-all">
                <div className="flex items-center gap-2 mb-6 text-zinc-400">
                    <TrendingUp size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Evolução do Atraso</h3>
                </div>
                <OverdueEvolutionChart invoices={filteredInvoices} />
            </div>
        </div>
      </div>

      {/* 3. Estrutura e Correlações */}
      <SectionTitle title="Estrutura de Gastos" icon={<LayoutGrid className="text-blue-500" />} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-8">
            <CategoryCorrelation invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full hover:border-zinc-700/50 transition-all">
                <div className="flex items-center gap-2 mb-6 text-zinc-400">
                    <PieChartIcon size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Recorrência</h3>
                </div>
                <RecurrenceChart invoices={filteredInvoices} />
            </div>
        </div>
        <div className="lg:col-span-6">
            <MarketComparison invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full hover:border-zinc-700/50 transition-all">
                <div className="flex items-center gap-2 mb-6 text-zinc-400">
                    <LayoutGrid size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Comparativo de Categorias</h3>
                </div>
                <CategoryComparisonChart invoices={filteredInvoices} />
            </div>
        </div>
      </div>

      {/* 4. Fornecedores e Padrões */}
      <SectionTitle title="Fornecedores e Padrões" icon={<Search className="text-emerald-500" />} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-4 flex flex-col gap-6">
            <AveragePaymentTime invoices={filteredInvoices} />
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex-1 hover:border-zinc-700/50 transition-all">
                <div className="flex items-center gap-2 mb-6 text-zinc-400">
                    <Zap size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Distribuição de Valores</h3>
                </div>
                <ValueDistributionChart invoices={filteredInvoices} />
            </div>
        </div>
        <div className="lg:col-span-8">
            <ProviderRanking invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-6">
            <ConcentrationAlerts invoices={filteredInvoices} />
        </div>
        <div className="lg:col-span-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full hover:border-zinc-700/50 transition-all">
                <div className="flex items-center gap-2 mb-6 text-zinc-400">
                    <Calendar size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Análise de Sazonalidade</h3>
                </div>
                <SeasonalityHeatmap invoices={filteredInvoices} />
            </div>
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
