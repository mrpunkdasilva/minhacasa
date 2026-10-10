import { Calculator as CalculatorIcon, Trash2 } from "lucide-react";

import { HISTORY_SEPARATOR, HistoryEntry, historyTotal } from "./engine/types";

interface HistoryListProps {
  history: HistoryEntry[];
  onClear: () => void;
}

/**
 * Pure presentational component: it receives the log and flattens it into one
 * continuous line, oldest first, closed by the running total. Kept free of
 * state and of the reducer so the mapping from state to markup can be verified
 * directly.
 */
export default function HistoryList({ history, onClear }: HistoryListProps) {
  // Newest first in the state, but a session reads forward in time.
  const operations = history.map((entry) => entry.expression).reverse();
  const total = historyTotal(history);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <CalculatorIcon size={14} className="text-emerald-500" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Cálculos recentes
          </h3>
          {history.length > 0 && (
            <span
              data-testid="history-count"
              className="text-[10px] font-black text-zinc-600 bg-black/40 px-1.5 py-0.5 rounded"
            >
              {history.length}
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-600 hover:text-rose-500 transition-colors"
          >
            <Trash2 size={11} />
            Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-zinc-600 text-sm py-8 text-center">
          Os últimos cálculos aparecem aqui.
        </p>
      ) : (
        // One single line rather than one row per calculation: the entries are
        // joined inline, so the whole session stays readable as a single strip.
        <p
          data-testid="history-line"
          className="bg-black/40 border border-zinc-800/50 rounded-lg px-3 py-3 font-mono text-sm leading-relaxed text-zinc-300"
        >
          {operations.join(` ${HISTORY_SEPARATOR} `)}
          <span
            data-testid="history-total"
            className="text-emerald-500 font-black"
          >
            {` ${HISTORY_SEPARATOR} Total ${total.value}`}
          </span>
          {total.invalid > 0 && (
            <span data-testid="history-invalid" className="text-rose-500">
              {` (${total.invalid} sem resultado)`}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
