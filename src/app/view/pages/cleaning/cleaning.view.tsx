"use client";

import { useState } from "react";
import CleaningChecklist from "./components/cleaning-checklist";
import CleaningSchedule from "./components/cleaning-schedule";
import CleaningHistory from "./components/cleaning-history";

type CleaningTab = "checklist" | "schedule" | "history";

export default function CleaningView() {
  const [activeTab, setActiveTab] = useState<CleaningTab>("checklist");

  const tabs: { id: CleaningTab; label: string }[] = [
    { id: "checklist", label: "Checklist Diário" },
    { id: "schedule", label: "Rotinas" },
    { id: "history", label: "Histórico de Faxina" },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl min-h-screen bg-black">
      <div className="flex flex-col space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">Gestão de Limpeza</h1>
            <p className="text-zinc-500 mt-2">Mantenha sua casa em ordem com rotinas e checklists organizados.</p>
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-md font-bold text-sm hover:bg-zinc-200 transition-all">
            + Nova Tarefa
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id ? "text-emerald-500" : "text-zinc-500 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-8 animate-in fade-in duration-500">
          {activeTab === "checklist" && <CleaningChecklist />}
          {activeTab === "schedule" && <CleaningSchedule />}
          {activeTab === "history" && <CleaningHistory />}
        </div>
      </div>
    </div>
  );
}
