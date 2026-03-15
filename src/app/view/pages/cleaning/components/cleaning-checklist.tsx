"use client";

import { useState } from "react";
import { cleaningTasksMock } from "@/app/infra/mocks/cleaning/cleaning.mock";
import { CleaningFrequency } from "@/app/domain/enums/cleaning/cleaning.enums";

export default function CleaningChecklist() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  const dailyTasks = cleaningTasksMock.filter(
    (task) => task.frequency === CleaningFrequency.DAILY
  );

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const progress = (completedTasks.length / dailyTasks.length) * 100;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
        <div>
          <h2 className="text-xl font-bold text-white">Checklist Diário</h2>
          <p className="text-sm text-zinc-500">O que você já fez hoje?</p>
        </div>
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-400">
            <span>Progresso Hoje</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {dailyTasks.map((task) => (
          <div 
            key={task.id} 
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              completedTasks.includes(task.id) 
                ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" 
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                checked={completedTasks.includes(task.id)} 
                onChange={() => toggleTask(task.id)}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <h3 className={`font-medium ${completedTasks.includes(task.id) ? "line-through text-zinc-500" : "text-white"}`}>
                  {task.title}
                </h3>
                <span className="text-xs text-zinc-500">{task.room}</span>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase font-mono italic">
                {task.estimatedTime} min
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
