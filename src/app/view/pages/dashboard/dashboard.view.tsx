import { getInvoices } from "@/app/infra/actions/invoice.actions";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { MonthlyExpensesChart } from "./components/monthly-expenses-chart";
import { CategoryDistributionChart } from "./components/category-distribution-chart";

export default async function DashboardView() {
  const invoices = await getInvoices();

  const totalInvoices = invoices.reduce(
    (acc, inv) => acc + inv.price.amount,
    0,
  );
  const totalPaid = invoices
    .filter((inv) => inv.status === InvoiceStatus.paid)
    .reduce((acc, inv) => acc + inv.price.amount, 0);
  const totalPending = invoices
    .filter((inv) => inv.status === InvoiceStatus.unpaid)
    .reduce((acc, inv) => acc + inv.price.amount, 0);
  const totalOverdue = invoices
    .filter((inv) => inv.status === InvoiceStatus.overdue)
    .reduce((acc, inv) => acc + inv.price.amount, 0);

  const pendingInvoices = invoices
    .filter((inv) => inv.status === InvoiceStatus.unpaid)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl text-white">
      <h1 className="text-3xl font-bold tracking-tighter mb-8">Visão Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard
          title="Total Geral"
          value={totalInvoices}
          subtitle="Soma de todas as contas"
          color="zinc"
        />
        <SummaryCard
          title="Total Pago"
          value={totalPaid}
          subtitle="Contas liquidadas"
          color="emerald"
        />
        <SummaryCard
          title="Pendente"
          value={totalPending}
          subtitle="Contas a vencer"
          color="amber"
        />
        <SummaryCard
          title="Atrasado"
          value={totalOverdue}
          subtitle="Contas vencidas"
          color="rose"
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
              href="/view/pages/invoices"
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
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                {pendingInvoices.map((invoice) => (
                  <Link
                    key={invoice.uuid}
                    href={`/view/pages/invoices/${invoice.uuid}`}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-full flex-shrink-0 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-emerald-500 transition-colors">
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
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 border-t border-zinc-800/50 pt-3 sm:border-0 sm:pt-0">
                      <p className="font-mono font-bold text-lg sm:text-base">
                        {invoice.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">
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

  return (
    <div
      className={`bg-zinc-900 border ${colorMap[color]} rounded-lg p-6 flex flex-col justify-between h-32`}
    >
      <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
        {title}
      </h3>
      <div>
        <span className={`text-2xl font-bold font-mono ${textColorMap[color]}`}>
          {value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
