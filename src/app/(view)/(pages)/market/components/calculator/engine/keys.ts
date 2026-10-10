import { CalculatorAction, KeyKind, Operator } from "./types";
import { getStrategy, UNARY_STRATEGIES } from "./strategies";

/**
 * Command: a key is data that knows which action it dispatches.
 *
 * The keypad is then a plain map over this array. The view never inspects a
 * key label to decide behaviour, which is what previously forced a second
 * switch statement next to the arithmetic one.
 */
export interface CalculatorKey {
  id: string;
  /** Rendered on the key face. */
  label: string;
  kind: KeyKind;
  ariaLabel: string;
  action: CalculatorAction;
}

const digit = (value: string): CalculatorKey => ({
  id: `digit-${value}`,
  label: value,
  kind: "digit",
  ariaLabel: value === "." ? "Ponto decimal" : value,
  action: { type: "digit", value },
});

const operator = (symbol: Operator): CalculatorKey => ({
  id: `operator-${symbol}`,
  label: symbol,
  kind: "operator",
  ariaLabel: getStrategy(symbol).ariaLabel,
  action: { type: "operator", operator: symbol },
});

const action = (
  id: string,
  label: string,
  dispatch: CalculatorAction,
): CalculatorKey => ({
  id,
  label,
  kind: "action",
  ariaLabel: UNARY_STRATEGIES[id]?.ariaLabel ?? label,
  action: dispatch,
});

/**
 * Four columns x five rows. A 4x5 grid means no empty cell: an earlier
 * 19-key layout left a hole in the bottom-right corner.
 */
export const CALCULATOR_KEYS: CalculatorKey[] = [
  action("clear", "C", { type: "clear" }),
  action("negate", "±", { type: "negate" }),
  action("percent", "%", { type: "percent" }),
  operator("÷"),
  digit("7"),
  digit("8"),
  digit("9"),
  operator("×"),
  digit("4"),
  digit("5"),
  digit("6"),
  operator("-"),
  digit("1"),
  digit("2"),
  digit("3"),
  operator("+"),
  digit("0"),
  digit("."),
  action("backspace", "⌫", { type: "backspace" }),
  {
    id: "equals",
    label: "=",
    kind: "equals",
    ariaLabel: "Resultado",
    action: { type: "equals" },
  },
];
