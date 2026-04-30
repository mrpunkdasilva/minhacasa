"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { Plus, Wallet, ShieldCheck, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { deleteIncome } from "@/app/infra/actions/income.actions";

interface IncomesViewProps {
  incomes: IncomeEntity[];
}

export function IncomesView({ incomes }: IncomesViewProps) {
  const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount.amount, 0);

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta entrada?")) {
      await deleteIncome(id);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      {/* ... header remains same ... */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tighter text-white">
            Suas Entradas
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Gerencie suas fontes de receita e ganhos.</p>
        </div>
        <Link
          href="/incomes/new"
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={16} />
          Nova Entrada
        </Link>
      </div>

      {/* Summary Card */}
      <div className="bg-zinc-900 border border-emerald-500/20 rounded-xl p-6 mb-10 flex items-center gap-6">
        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
            <Wallet size={32} />
        </div>
        <div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Receita Total Acumulada</p>
            <p className="text-4xl font-black text-white font-mono">
                {totalIncomes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium text-nowrap">Fonte / Nome</th>
                <th className="px-6 py-4 font-medium text-nowrap">Data</th>
                <th className="px-6 py-4 font-medium text-nowrap">Categoria</th>
                <th className="px-6 py-4 font-medium text-right text-nowrap">Valor</th>
                <th className="px-6 py-4 font-medium text-center text-nowrap">Recorrência</th>
                <th className="px-6 py-4 font-medium text-right text-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    Nenhuma entrada registrada ainda.
                  </td>
                </tr>
              ) : (
                incomes.map((income) => (
                  <tr key={income.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white text-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{income.name}</span>
                        {income.ownerId && (
                          <ShieldCheck size={14} className="text-emerald-500 opacity-60" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-nowrap">
                      {new Date(income.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-nowrap">
                      <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                        {income.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-500 font-mono font-bold text-nowrap">
                      {income.amount.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-6 py-4 text-center text-nowrap">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            income.recurrence.isRecurring ? "bg-blue-500/20 text-blue-500" : "bg-zinc-800 text-zinc-500"
                        }`}>
                            {income.recurrence.isRecurring ? "Recorrente" : "Única"}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right text-nowrap">
                        <div className="flex items-center justify-end gap-2">
                            <Link 
                                href={`/incomes/${income.id}/edit`}
                                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all"
                            >
                                <Pencil size={16} />
                            </Link>
                            <button 
                                onClick={() => handleDelete(income.id)}
                                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-rose-500 transition-all"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
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
