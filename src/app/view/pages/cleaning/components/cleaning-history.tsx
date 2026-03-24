"use client";

import {
  cleaningLogsMock,
  cleaningTasksMock,
} from "@/app/infra/mocks/cleaning/cleaning.mock";

export default function CleaningHistory() {
  const getTaskName = (id: string) =>
    cleaningTasksMock.find((t) => t.id === id)?.title || "Desconhecido";
  const isHeavy = (id: string) =>
    cleaningTasksMock.find((t) => t.id === id)?.isHeavyCleaning || false;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-rose-950/20 border border-rose-500/20 p-6 rounded-lg">
        <div>
          <h2 className="text-xl font-bold text-rose-500">
            Histórico de Faxina Pesada
          </h2>
          <p className="text-sm text-zinc-500">
            Últimos registros de limpezas intensas da casa.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white font-mono">
            {cleaningLogsMock.filter((log) => isHeavy(log.taskId)).length}
          </span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
            Eventos registrados
          </p>
        </div>
      </div>

      <div className="relative border-l border-zinc-800 ml-4 space-y-10 py-4">
        {cleaningLogsMock.map((log) => (
          <div key={log.id} className="relative pl-10">
            {/* Timeline dot */}
            <div
              className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ${isHeavy(log.taskId) ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-zinc-700"}`}
            />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono text-zinc-500">
                {log.completedAt.toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <div className="flex items-center gap-3">
                <h3 className="text-white font-bold text-lg">
                  {getTaskName(log.taskId)}
                </h3>
                {isHeavy(log.taskId) && (
                  <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-bold uppercase">
                    Pesada
                  </span>
                )}
              </div>
              {log.notes && (
                <p className="text-sm text-zinc-400 italic bg-zinc-900/40 p-3 rounded mt-2 border border-zinc-800/50">
                  &quot;{log.notes}&quot;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
