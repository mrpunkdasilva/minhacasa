import { Category } from "@/app/domain/enums/category/category";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";

interface MarketAnalysisProps {
  invoices: InvoiceEntity[];
}

export default function MarketAnalysis({ invoices }: MarketAnalysisProps) {
  // Filter for market/food related expenses
  const marketExpenses = invoices.filter(
    (inv) => inv.category === Category.FOOD || inv.category === Category.MARKET,
  );

  const totalMarketSpent = marketExpenses.reduce(
    (acc, inv) => acc + inv.price.amount,
    0,
  );

  const currentMonth = new Date().getMonth();
  const currentMonthExpenses = marketExpenses.filter(
    (inv) => new Date(inv.dueDate).getMonth() === currentMonth,
  );

  const totalCurrentMonth = currentMonthExpenses.reduce(
    (acc, inv) => acc + inv.price.amount,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center text-white">
        <h2 className="text-xl font-semibold">Análise de Gastos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between h-32">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
            Total este Mês
          </h3>
          <div>
            <span className="text-2xl font-bold font-mono text-emerald-500">
              {totalCurrentMonth.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            <p className="text-[10px] text-zinc-500 mt-1">
              Baseado em {currentMonthExpenses.length} faturas
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between h-32">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
            Média por Compra (Total)
          </h3>
          <div>
            <span className="text-2xl font-bold font-mono text-white">
              {(totalMarketSpent / marketExpenses.length || 0).toLocaleString(
                "pt-BR",
                { style: "currency", currency: "BRL" },
              )}
            </span>
            <p className="text-[10px] text-zinc-500 mt-1">
              Baseado em {marketExpenses.length} compras totais
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between h-32">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">
            Geral Acumulado
          </h3>
          <div>
            <span className="text-2xl font-bold font-mono text-amber-500">
              {totalMarketSpent.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
            <p className="text-[10px] text-zinc-500 mt-1">
              Soma de todas as compras de mercado
            </p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 bg-zinc-800/30">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Histórico de Compras de Mercado
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-500 text-[10px] uppercase font-bold tracking-widest border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3 text-nowrap">Data</th>
                <th className="px-6 py-3 text-nowrap">Descrição</th>
                <th className="px-6 py-3 text-right text-nowrap">Valor</th>
                <th className="px-6 py-3 text-center text-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {marketExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-zinc-500 italic"
                  >
                    Nenhuma compra de mercado registrada ainda.
                  </td>
                </tr>
              ) : (
                marketExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-zinc-400 text-nowrap">
                      {new Date(expense.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white text-nowrap">
                      {expense.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-mono text-white text-nowrap">
                      {expense.price.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center text-nowrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          expense.status === InvoiceStatus.paid
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {expense.status === InvoiceStatus.paid
                          ? "PAGO"
                          : "PENDENTE"}
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
