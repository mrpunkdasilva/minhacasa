import { invoicesMock } from "@/app/infra/mocks/invoice.mock";

export default function InvoicesListView() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter">
          Suas Contas
        </h1>
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
              <tr key={invoice.uuid} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{invoice.name}</td>
                <td className="px-6 py-4 text-zinc-400">
                  {new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                    {invoice.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-white font-mono">
                  {invoice.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    invoice.status === "paid" ? "bg-emerald-500/20 text-emerald-500" :
                    invoice.status === "overdue" ? "bg-rose-500/20 text-rose-500" :
                    "bg-amber-500/20 text-amber-500"
                  }`}>
                    {invoice.status}
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
