export type Operator = "+" | "-" | "×" | "÷";

export type KeyKind = "digit" | "operator" | "action" | "equals";

/**
 * One completed calculation.
 *
 * The result is kept as a number next to the readable text because the running
 * total is derived from it; recomputing it by parsing the string back would be
 * guesswork.
 */
export interface HistoryEntry {
  /** Readable form of the operation, e.g. "1 + 2 = 3". */
  expression: string;
  /** Computed result, possibly non-finite for "1 ÷ 0". */
  result: number;
}

/**
 * Immutable calculator state. A single object (instead of several useState
 * calls) keeps transitions atomic: a keypress can never leave `display` and
 * `stored` disagreeing with each other.
 */
export interface CalculatorState {
  /** Raw text being typed, dot as the decimal separator. */
  display: string;
  /** Left-hand operand awaiting an operator. `null` when idle. */
  stored: number | null;
  /** Pending binary operator. `null` when idle. */
  operator: Operator | null;
  /** When true, the next digit replaces `display` instead of appending. */
  replace: boolean;
  /**
   * Committed prefix of the line being typed, always ending with a pending
   * operator, e.g. `"1 + 2 + "`. Together with `display` it renders the whole
   * running expression, so the user sees the cumulative line rather than a
   * single isolated operation.
   */
  tape: string;
  /**
   * Full expression including its result, set by `=` and cleared by the next
   * keypress. Keeping it separately is what lets the finished line stay on
   * screen while the display already shows the value to continue from.
   */
  evaluated: string | null;
  /** Most recent completed calculations, newest first. */
  history: HistoryEntry[];
}

export type CalculatorAction =
  | { type: "digit"; value: string }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "clearHistory" }
  | { type: "negate" }
  | { type: "percent" }
  | { type: "backspace" };

/**
 * How many completed calculations are retained.
 *
 * Every finished operation is kept, not just the last one: a run like
 * 1+1, 1+2, 2+2, 2+2, 2+2 must all remain visible. The cap only exists to bound
 * memory, so it is set well above any realistic shopping session.
 */
export const HISTORY_LIMIT = 50;

export const initialCalculatorState: CalculatorState = {
  display: "0",
  stored: null,
  operator: null,
  replace: false,
  tape: "",
  evaluated: null,
  history: [],
};

/** Separator between entries when the log is flattened into a single line. */
export const HISTORY_SEPARATOR = "·";

/** Running total of the session, plus how many entries had no usable result. */
export interface HistoryTotal {
  value: number;
  invalid: number;
}

/**
 * Sums the results of every logged calculation.
 *
 * Division by zero yields a non-finite result, displayed as "Erro"; such an
 * entry is counted separately instead of poisoning the sum with NaN.
 */
export const historyTotal = (history: HistoryEntry[]): HistoryTotal => {
  let value = 0;
  let invalid = 0;

  for (const entry of history) {
    if (Number.isFinite(entry.result)) value += entry.result;
    else invalid += 1;
  }

  return { value, invalid };
};

/** Numeric value of the current display. */
export const currentValue = (state: CalculatorState): number =>
  parseFloat(state.display) || 0;

/**
 * The cumulative expression shown at the top of the calculator.
 *
 * Three cases, in order of precedence:
 * 1. Right after `=`, the finished line wins, e.g. `"1 + 2 + 2 = 5"`.
 * 2. With no committed prefix, the display is the whole expression.
 * 3. While an operator waits for its operand, the tape is shown alone, because
 *    `display` still holds the previous value and appending it would repeat it.
 */
export const expressionPreview = (state: CalculatorState): string => {
  if (state.evaluated !== null) return state.evaluated;

  const tape = state.tape.trimEnd();
  if (tape === "") return state.display;

  return state.replace ? tape : `${tape} ${state.display}`;
};
