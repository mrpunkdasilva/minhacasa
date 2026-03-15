"use client";

import { maintenanceTasksMock } from "@/app/infra/mocks/infrastructure/infrastructure.mock";

export default function MaintenanceSchedule() {
  const statusConfig = {
    ok: {
      label: "Em Dia",
      className: "bg-emerald-500/10 text-emerald-500",
      icon: "✅",
    },
    warning: {
      label: "Vence Logo",
      className: "bg-amber-500/10 text-amber-500",
      icon: "⚠️",
    },
    overdue: {
      label: "Atrasado",
      className: "bg-rose-500/10 text-rose-500",
      icon: "🚨",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Cronograma de Manutenção</h2>
        <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium">
          Agendar Tarefa
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4 text-nowrap">Tarefa</th>
                <th className="px-6 py-4 text-nowrap">Frequência</th>
                <th className="px-6 py-4 text-nowrap">Última Realização</th>
                <th className="px-6 py-4 text-nowrap">Próximo Vencimento</th>
                <th className="px-6 py-4 text-center text-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {maintenanceTasksMock.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-6 py-4 text-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {task.title}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {task.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-nowrap">
                    <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                      {task.frequency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400 font-mono text-nowrap">
                    {task.lastPerformedDate.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-nowrap">
                    <span
                      className={`text-sm font-bold font-mono ${
                        task.status === "overdue"
                          ? "text-rose-500"
                          : task.status === "warning"
                            ? "text-amber-500"
                            : "text-white"
                      }`}
                    >
                      {task.nextDueDate.toLocaleDateString("pt-BR")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusConfig[task.status].className}`}
                    >
                      {statusConfig[task.status].icon}{" "}
                      {statusConfig[task.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
