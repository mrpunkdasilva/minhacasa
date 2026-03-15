"use client";

import { useState } from "react";
import AssetsList from "./components/assets-list";
import MaintenanceSchedule from "./components/maintenance-schedule";
import SystemsOverview from "./components/systems-overview";
import ConsumptionTracker from "./components/consumption-tracker";

type InfraTab = "assets" | "maintenance" | "systems" | "consumption";

export default function InfrastructureView() {
  const [activeTab, setActiveTab] = useState<InfraTab>("assets");

  const tabs: { id: InfraTab; label: string }[] = [
    { id: "assets", label: "Equipamentos" },
    { id: "maintenance", label: "Manutenção" },
    { id: "systems", label: "Sistemas Core" },
    { id: "consumption", label: "Consumo" },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl min-h-screen bg-black">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Infraestrutura</h1>
          <p className="text-zinc-500 mt-2">Gestão completa dos ativos, sistemas e manutenção da sua casa.</p>
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
          {activeTab === "assets" && <AssetsList />}
          {activeTab === "maintenance" && <MaintenanceSchedule />}
          {activeTab === "systems" && <SystemsOverview />}
          {activeTab === "consumption" && <ConsumptionTracker />}
        </div>
      </div>
    </div>
  );
}
