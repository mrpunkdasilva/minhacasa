import {
  CalculatorAction,
  CalculatorState,
  HISTORY_LIMIT,
  HistoryEntry,
  currentValue,
  initialCalculatorState,
} from "./types";
import { getStrategy, UNARY_STRATEGIES } from "./strategies";
import { formatDisplay } from "./format";

const pushHistory = (
  state: CalculatorState,
  entry: HistoryEntry,
): HistoryEntry[] => [entry, ...state.history].slice(0, HISTORY_LIMIT);

const describeOperation = (
  left: number,
  operator: CalculatorState["operator"],
  right: number,
  result: number,
): HistoryEntry => ({
  expression: `${formatDisplay(left)} ${operator} ${formatDisplay(right)} = ${formatDisplay(result)}`,
  result,
});

/**
 * The state machine. Every transition is a pure function of
 * (state, action) -> state, which is what makes the calculator testable
 * without mounting a component and keeps React out of the arithmetic.
 */
export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case "digit": {
      const { value } = action;
      // A digit typed after `=` abandons the finished line and starts over.
      const base =
        state.evaluated !== null
          ? { ...state, tape: "", evaluated: null }
          : state;

      if (value === ".") {
        if (base.display.includes(".")) return base;
        return {
          ...base,
          display:
            base.replace || base.display === "0" ? "0." : `${base.display}.`,
          replace: false,
        };
      }

      if (base.replace) {
        return { ...base, display: value, replace: false };
      }

      return {
        ...base,
        display: base.display === "0" ? value : base.display + value,
      };
    }

    case "operator": {
      const operand = currentValue(state);

      // The tape grows by the operand the user just finished plus the new
      // operator. When an operator is pressed twice in a row nothing was typed
      // in between, so the stale operator is swapped instead of duplicated.
      const pending = state.operator ? `${state.operator} ` : "";
      const committed =
        state.replace && state.tape.endsWith(pending)
          ? state.tape.slice(0, -pending.length)
          : state.tape;
      // After `=`, the result itself opens the next line.
      const carriesOperand = !state.replace || state.evaluated !== null;
      const tape = `${
        state.evaluated !== null ? "" : committed
      }${carriesOperand ? `${formatDisplay(operand)} ` : ""}${action.operator} `;

      // Chaining "2 + 3 ×" folds the pending operation first, matching the
      // behaviour of a physical calculator with immediate execution.
      if (state.operator !== null && state.stored !== null && !state.replace) {
        const result = getStrategy(state.operator).compute(
          state.stored,
          operand,
        );
        return {
          ...state,
          display: formatDisplay(result),
          stored: result,
          operator: action.operator,
          replace: true,
          tape,
          evaluated: null,
          history: pushHistory(
            state,
            describeOperation(state.stored, state.operator, operand, result),
          ),
        };
      }

      return {
        ...state,
        stored: operand,
        operator: action.operator,
        replace: true,
        tape,
        evaluated: null,
      };
    }

    case "equals": {
      if (state.operator === null || state.stored === null) return state;

      const right = currentValue(state);
      const result = getStrategy(state.operator).compute(state.stored, right);

      return {
        ...state,
        display: formatDisplay(result),
        stored: null,
        operator: null,
        replace: true,
        tape: "",
        evaluated: `${state.tape}${formatDisplay(right)} = ${formatDisplay(result)}`,
        history: pushHistory(
          state,
          describeOperation(state.stored, state.operator, right, result),
        ),
      };
    }

    case "clear": {
      // Keeps the history: the user is clearing the entry, not the log.
      return { ...initialCalculatorState, history: state.history };
    }

    case "clearHistory": {
      // Drops the log only; the calculation in progress is untouched.
      return { ...state, history: [] };
    }

    case "negate":
    case "percent": {
      const strategy = UNARY_STRATEGIES[action.type];
      if (action.type === "negate" && state.display === "0") return state;

      const result = strategy.compute(currentValue(state), {
        stored: state.stored,
      });

      return { ...state, display: formatDisplay(result), replace: true };
    }

    case "backspace": {
      if (state.replace) return state;
      return { ...state, display: state.display.slice(0, -1) || "0" };
    }

    default:
      return state;
  }
}
