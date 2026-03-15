import { invoicesMock } from "@/app/infra/mocks/invoice/invoice.mock";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";

export default function InvoicesListView() {
  const totals = invoicesMock.reduce(
    (acc, inv) => {
      acc.total += inv.price;
      if (inv.status === InvoiceStatus.paid) acc.paid += inv.price;
      if (inv.status === InvoiceStatus.unpaid) acc.unpaid += inv.price;
      if (inv.status === InvoiceStatus.overdue) acc.overdue += inv.price;
      return acc;
    },
    { total: 0, paid: 0, unpaid: 0, overdue: 0 },
  );

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter">Suas Contas</h1>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total" value={totals.total} color="zinc" />
        <StatCard title="Pago" value={totals.paid} color="emerald" />
        <StatCard title="Pendente" value={totals.unpaid} color="amber" />
        <StatCard title="Atrasado" value={totals.overdue} color="rose" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800/50 text-zinc-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Nome</th>
              <th className="px-6 py-4 font-medium">Vencimento</th>
              <th className="px-6 py-4 font-medium">Categoria</th>
              <th className="px-6 py-4 font-medium text-right">Valor</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {invoicesMock.map((invoice) => (
              <tr
                key={invoice.uuid}
                className="hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {invoice.name}
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                    {invoice.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-white font-mono">
                  {invoice.price.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-6 py-4 text-center">
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
            ))}
          </tbody>
        </table>
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
