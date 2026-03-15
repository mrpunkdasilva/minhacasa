"use client";

import { useState } from "react";
import PetList from "./components/pet-list";
import HealthRecords from "./components/health-records";
import NutritionStatus from "./components/nutrition-status";
import PetAgenda from "./components/pet-agenda";

type PetTab = "pets" | "health" | "nutrition" | "agenda";

export default function PetsView() {
  const [activeTab, setActiveTab] = useState<PetTab>("pets");

  const tabs: { id: PetTab; label: string }[] = [
    { id: "pets", label: "Meus Pets" },
    { id: "health", label: "Saúde" },
    { id: "nutrition", label: "Alimentação" },
    { id: "agenda", label: "Agenda" },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl min-h-screen bg-black">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Pet Care</h1>
          <p className="text-zinc-500 mt-2">
            Gestão completa da saúde, alimentação e bem-estar dos seus pets.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-emerald-500"
                  : "text-zinc-500 hover:text-white"
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
          {activeTab === "pets" && <PetList />}
          {activeTab === "health" && <HealthRecords />}
          {activeTab === "nutrition" && <NutritionStatus />}
          {activeTab === "agenda" && <PetAgenda />}
        </div>
      </div>
    </div>
  );
}
