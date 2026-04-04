import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { getInvoices } from "@/app/infra/actions/invoice.actions";

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
        <StatCard title="Total" value={totals.total} color="zinc" />
        <StatCard title="Pago" value={totals.paid} color="emerald" />
        <StatCard title="Pendente" value={totals.unpaid} color="amber" />
        <StatCard title="Atrasado" value={totals.overdue} color="rose" />
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
  color,
}: {
  title: string;
  value: number;
  color: "zinc" | "emerald" | "amber" | "rose";
}) {
  const colorMap = {
    zinc: "border-zinc-800 text-white",
    emerald: "border-emerald-500/30 text-emerald-500",
    amber: "border-amber-500/30 text-amber-500",
    rose: "border-rose-500/30 text-rose-500",
  };

  return (
    <div className={`bg-zinc-900 border ${colorMap[color]} rounded-lg p-5`}>
      <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">
        {title}
      </p>
      <p
        className={`text-xl font-bold font-mono ${colorMap[color].split(" ").pop()}`}
      >
        {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>
    </div>
  );
}
