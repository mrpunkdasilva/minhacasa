import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { getInvoices } from "@/app/infra/actions/invoice.actions";
import { StatusDistributionChart } from "./components/status-distribution-chart";
import { TemporalTrendChart } from "./components/temporal-trend-chart";
import { OverdueRiskAnalysis } from "./components/overdue-risk-analysis";
import { AdvancedInsights } from "./components/advanced-insights";
import { PaymentForecast } from "./components/payment-forecast";

export default async function InvoicesListView() {
  const invoices = await getInvoices();

  const totals = invoices.reduce(
    (acc, inv) => {
      const amount = inv.price.amount;
      acc.total += amount;
      if (inv.status === InvoiceStatus.paid) acc.paid += amount;
      if (inv.status === InvoiceStatus.unpaid) acc.unpaid += amount;
      if (inv.status === InvoiceStatus.overdue) acc.overdue += amount;
      return acc;
    },
    { total: 0, paid: 0, unpaid: 0, overdue: 0 },
  );

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Suas Contas
        </h1>
        <Link
          href="/invoices/new"
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={16} />
          Nova Fatura
        </Link>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Total"
          value={totals.total}
          subtitle="Soma de todas as contas"
          color="zinc"
        />
        <StatCard
          title="Pago"
          value={totals.paid}
          subtitle="Contas liquidadas"
          color="emerald"
        />
        <StatCard
          title="Pendente"
          value={totals.unpaid}
          subtitle="Contas a vencer"
          color="amber"
        />
        <StatCard
          title="Atrasado"
          value={totals.overdue}
          subtitle="Contas vencidas"
          color="rose"
        />
      </div>

      {/* Analytics Section */}
      <div className="space-y-8 mb-10">
        {/* Risk Analysis */}
        <OverdueRiskAnalysis invoices={invoices} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Distribuição por Status
            </h3>
            <StatusDistributionChart invoices={invoices} />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Tendência Temporal
            </h3>
            <TemporalTrendChart invoices={invoices} />
          </div>
        </div>

        {/* Advanced Insights */}
        <AdvancedInsights invoices={invoices} />

        {/* Payment Forecast */}
        <PaymentForecast invoices={invoices} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium text-nowrap">Nome</th>
                <th className="px-6 py-4 font-medium text-nowrap">
                  Vencimento
                </th>
                <th className="px-6 py-4 font-medium text-nowrap">Categoria</th>
                <th className="px-6 py-4 font-medium text-right text-nowrap">
                  Valor
                </th>
                <th className="px-6 py-4 font-medium text-center text-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    Nenhuma fatura encontrada.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white text-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="hover:text-emerald-500 transition-colors"
                        >
                          {invoice.name}
                        </Link>
                        {invoice.ownerId && (
                          <ShieldCheck
                            size={14}
                            className="text-emerald-500 opacity-60"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-nowrap">
                      {new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-nowrap">
                      <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                        {invoice.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-white font-mono text-nowrap">
                      {invoice.price.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center text-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          invoice.status === InvoiceStatus.paid
                            ? "bg-emerald-500/20 text-emerald-500"
                            : invoice.status === InvoiceStatus.overdue
                              ? "bg-rose-500/20 text-rose-500"
                              : "bg-amber-500/20 text-amber-500"
                        }`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status: InvoiceStatus) {
  switch (status) {
    case InvoiceStatus.paid:
      return "Pago";
    case InvoiceStatus.unpaid:
      return "Pendente";
    case InvoiceStatus.overdue:
      return "Atrasado";
    case InvoiceStatus.scheduled:
      return "Agendado";
    default:
      return status;
  }
}

function StatCard({
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
    zinc: "border-zinc-800 text-white",
    emerald: "border-emerald-500/30 text-emerald-500",
    amber: "border-amber-500/30 text-amber-500",
    rose: "border-rose-500/30 text-rose-500",
  };

  const formattedValue = value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Dynamic font size based on value length
  const getFontSize = (len: number) => {
    if (len > 16) return "text-sm";
    if (len > 13) return "text-base";
    if (len > 10) return "text-lg";
    return "text-xl";
  };

  return (
    <div
      className={`bg-zinc-900 border ${colorMap[color]} rounded-lg p-5 flex flex-col justify-between min-h-28 h-full transition-all hover:bg-zinc-800/10`}
    >
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        <p
          className={`${getFontSize(formattedValue.length)} font-bold font-mono ${colorMap[color].split(" ").pop()} leading-none break-all sm:break-normal`}
          title={formattedValue}
        >
          {formattedValue}
        </p>
        <p className="text-[10px] text-zinc-500 font-medium leading-tight">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
