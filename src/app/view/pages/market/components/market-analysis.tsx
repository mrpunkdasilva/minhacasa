import { invoicesMock } from "@/app/infra/mocks/invoice.mock";
import { Category } from "@/app/domain/enums/category/category";

export default function MarketAnalysis() {
  const marketExpenses = invoicesMock.filter(inv => inv.category === Category.FOOD);
  const totalMarketSpent = marketExpenses.reduce((acc, inv) => acc + inv.price, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Análise de Gastos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between h-32">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Acumulado (Março)</h3>
          <div>
            <span className="text-2xl font-bold font-mono text-emerald-500">
              {totalMarketSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <p className="text-[10px] text-zinc-500 mt-1">Comparado ao mês passado: <span className="text-emerald-500">-5%</span></p>
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between h-32">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Média por Compra</h3>
          <div>
            <span className="text-2xl font-bold font-mono text-white">
              {(totalMarketSpent / marketExpenses.length || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <p className="text-[10px] text-zinc-500 mt-1">Baseado em {marketExpenses.length} compras</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between h-32">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Meta Estipulada</h3>
          <div>
            <span className="text-2xl font-bold font-mono text-amber-500">R$ 1.200,00</span>
            <p className="text-[10px] text-zinc-500 mt-1">Você já usou <span className="text-amber-500">37%</span> da sua meta</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-800/30">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Histórico de Compras de Mercado</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-zinc-900 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
            <tr>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3">Local/Descrição</th>
              <th className="px-6 py-3 text-right">Valor</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {marketExpenses.map((expense) => (
              <tr key={expense.uuid} className="hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {new Date(expense.dueDate).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-white">{expense.name}</td>
                <td className="px-6 py-4 text-sm text-right font-mono text-white">
                  {expense.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">PAGO</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
