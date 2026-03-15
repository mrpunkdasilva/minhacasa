"use client";

import { cleaningTasksMock } from "@/app/infra/mocks/cleaning/cleaning.mock";
import { CleaningFrequency } from "@/app/domain/enums/cleaning/cleaning.enums";

export default function CleaningSchedule() {
  const frequencies = Object.values(CleaningFrequency);

  return (
    <div className="space-y-12">
      {frequencies.map((freq) => {
        const tasksByFreq = cleaningTasksMock.filter(
          (t) => t.frequency === freq,
        );
        if (tasksByFreq.length === 0) return null;

        return (
          <div key={freq} className="space-y-6">
            <h2 className="text-xl font-bold text-emerald-500 border-b border-zinc-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Rotina {freq}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasksByFreq.map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
                        {task.room}
                      </span>
                      {task.isHeavyCleaning && (
                        <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded font-bold uppercase">
                          Faxina Pesada
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-bold mb-1">{task.title}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {task.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600 font-mono italic">
                      ~ {task.estimatedTime} min
                    </span>
                    <button className="text-[10px] bg-zinc-800 text-zinc-300 px-3 py-1 rounded hover:bg-zinc-700 transition-all uppercase font-bold tracking-widest">
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
