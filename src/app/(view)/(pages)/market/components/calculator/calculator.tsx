"use client";

import { Delete } from "lucide-react";

import { CALCULATOR_KEYS } from "./engine/keys";
import { KeyKind } from "./engine/types";
import { formatDisplay } from "./engine/format";
import { useCalculator } from "./use-calculator";
import HistoryList from "./history-list";

const keyStyle = (kind: KeyKind, isActive: boolean): string => {
  const base =
    "h-16 rounded-xl text-xl font-black transition-all active:scale-95 select-none flex items-center justify-center";

  if (kind === "equals") {
    return `${base} bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]`;
  }
  if (kind === "operator") {
    return `${base} ${
      isActive
        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
        : "bg-zinc-800 text-emerald-500 hover:bg-zinc-700"
    }`;
  }
  if (kind === "action") {
    return `${base} bg-zinc-900 text-rose-500 border border-zinc-800 hover:bg-zinc-800`;
  }
  return `${base} bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800`;
};

export default function Calculator() {
  const {
    display,
    expression,
    settled,
    history,
    operator,
    press,
    pendingResult,
  } = useCalculator();

  const result = pendingResult();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl">
        <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 mb-4 text-right">
          {/* The cumulative line: every term typed since the last C or =. */}
          <div
            data-testid="expression"
            title="Expressão acumulada"
            className={`font-mono text-xs leading-relaxed break-all ${
              settled ? "text-emerald-500" : "text-zinc-500"
            }`}
          >
            {expression}
          </div>
          <div
            data-testid="display"
            className={`font-mono font-black text-white leading-tight break-all ${
              display.length > 12 ? "text-2xl" : "text-4xl"
            }`}
          >
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {CALCULATOR_KEYS.map((key) => (
            <button
              key={key.id}
              onClick={() => press(key.action)}
              className={keyStyle(key.kind, operator === key.label)}
              aria-label={key.ariaLabel}
              title={key.ariaLabel}
            >
              {key.label === "⌫" ? <Delete size={20} /> : key.label}
            </button>
          ))}
        </div>
      </div>

      <HistoryList
        history={history}
        onClear={() => press({ type: "clearHistory" })}
      />

      {result !== null && !settled && (
        <button
          onClick={() => press({ type: "equals" })}
          className="lg:col-span-2 bg-zinc-800 text-emerald-500 font-black py-3 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          = {formatDisplay(result)}
        </button>
      )}
    </div>
  );
}
