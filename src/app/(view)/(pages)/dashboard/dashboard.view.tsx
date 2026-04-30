import { getInvoices } from "@/app/infra/actions/invoice.actions";
import { getIncomes } from "@/app/infra/actions/income.actions";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Wallet,
} from "lucide-react";
import { MonthlyExpensesChart } from "./components/monthly-expenses-chart";
import { CategoryDistributionChart } from "./components/category-distribution-chart";

export default async function DashboardView() {
  const [invoices, incomes] = await Promise.all([
    getInvoices(),
    getIncomes()
  ]);

  const totalInvoices = invoices.reduce(
    (acc, inv) => acc + inv.price.amount,
    0,
  );
  
  const totalIncome = incomes.reduce(
    (acc, inc) => acc + inc.amount.amount,
    0,
  );

  const balance = totalIncome - totalInvoices;

  const totalPaid = invoices
    .filter((inv) => inv.status === InvoiceStatus.paid)
    .reduce((acc, inv) => acc + inv.price.amount, 0);
  
  const pendingInvoices = invoices
    .filter((inv) => inv.status === InvoiceStatus.unpaid)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tighter">Visão Geral</h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <Wallet size={16} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Saldo Acumulado</span>
                <span className={`text-sm font-black font-mono ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <SummaryCard
          title="Total em Receitas"
          value={totalIncome}
          subtitle="Tudo que entrou no período"
          color="emerald"
        />
        <SummaryCard
          title="Total em Contas"
          value={totalInvoices}
          subtitle="Soma de todos os gastos"
          color="rose"
        />
        <SummaryCard
          title="Total Pago"
          value={totalPaid}
          subtitle={`${((totalPaid/totalInvoices)*100 || 0).toFixed(1)}% das contas liquidadas`}
          color="zinc"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6 text-zinc-400">
            <BarChart3 size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Gastos Mensais
            </h3>
          </div>
          <MonthlyExpensesChart invoices={invoices} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6 text-zinc-400">
            <PieChartIcon size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Por Categoria
            </h3>
          </div>
          <CategoryDistributionChart invoices={invoices} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Próximos Vencimentos</h2>
            <Link
              href="/invoices"
              className="text-zinc-400 hover:text-emerald-500 text-sm flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

           <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
             {pendingInvoices.length === 0 ? (
               <div className="p-8 text-center text-zinc-500">
                 Nenhuma fatura pendente encontrada.
               </div>
             ) : (
               <div className="space-y-1">
                 {pendingInvoices.map((invoice) => (
                   <Link
                     key={invoice.id}
                     href={`/invoices/${invoice.id}`}
                     className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/50 transition-colors group border-b border-zinc-800 last:border-b-0"
                   >
                     <div className="flex items-center gap-4 min-w-0 flex-1">
                       <div className="w-10 h-10 bg-amber-500/10 rounded-full flex-shrink-0 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                         <Clock size={20} />
                       </div>
                       <div className="min-w-0">
                         <p className="font-medium group-hover:text-emerald-500 transition-colors truncate">
                           {invoice.name}
                         </p>
                         <p className="text-xs text-zinc-500">
                           Vence em{" "}
                           {new Date(invoice.dueDate).toLocaleDateString(
                             "pt-BR",
                           )}
                         </p>
                       </div>
                     </div>
                     <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 pt-2 sm:pt-0 sm:flex-shrink-0">
                       <p className="font-mono font-bold text-base sm:text-sm">
                         {invoice.price.amount.toLocaleString("pt-BR", {
                           style: "currency",
                           currency: "BRL",
                         })}
                       </p>
                       <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full uppercase font-bold">
                         Pendente
                       </span>
                     </div>
                   </Link>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: "zinc" | "emerald" | "amber" | "rose";
}) {
  const colorMap = {
    zinc: "border-zinc-800",
    emerald: "border-emerald-500/50",
    amber: "border-amber-500/50",
    rose: "border-rose-500/50",
  };

  const textColorMap = {
    zinc: "text-white",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    rose: "text-rose-500",
  };

  const formattedValue = value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Dynamic font size based on value length to prevent overflow
  const getFontSize = (len: number) => {
    if (len > 16) return "text-base";
    if (len > 13) return "text-lg";
    if (len > 10) return "text-xl";
    return "text-2xl";
  };

  return (
    <div
      className={`bg-zinc-900 border ${colorMap[color]} rounded-lg p-5 flex flex-col justify-between min-h-[8rem] h-full shadow-lg transition-all hover:scale-[1.02]`}
    >
      <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
        {title}
      </h3>
      <div className="flex flex-col gap-1">
        <span
          className={`${getFontSize(formattedValue.length)} font-bold font-mono ${textColorMap[color]} leading-none break-all sm:break-normal`}
          title={formattedValue}
        >
          {formattedValue}
        </span>
        <p className="text-[10px] text-zinc-500 font-medium leading-tight">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
