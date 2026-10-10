"use client";

import { useCallback, useReducer } from "react";

import { calculatorReducer } from "./engine/reducer";
import {
  CalculatorAction,
  currentValue,
  expressionPreview,
  initialCalculatorState,
} from "./engine/types";
import { getStrategy } from "./engine/strategies";

/**
 * Binds the pure state machine to React. All arithmetic lives in the engine;
 * this hook only owns the reducer instance and the derived selectors.
 */
export function useCalculator() {
  const [state, dispatch] = useReducer(
    calculatorReducer,
    initialCalculatorState,
  );

  const press = useCallback((action: CalculatorAction) => dispatch(action), []);

  /** The whole running expression, e.g. "1 + 2 + 2 + 2 = 7". */
  const expression = expressionPreview(state);

  /** True once a line is finished, which is when the display duplicates it. */
  const settled = state.evaluated !== null;

  /** Result of the pending operation, offered as a shortcut button. */
  const pendingResult = useCallback((): number | null => {
    if (state.stored === null || state.operator === null) return null;
    return getStrategy(state.operator).compute(
      state.stored,
      currentValue(state),
    );
  }, [state]);

  return {
    display: state.display,
    expression,
    settled,
    history: state.history,
    operator: state.operator,
    press,
    pendingResult,
  };
}
