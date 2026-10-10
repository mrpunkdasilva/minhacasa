import { Operator } from "./types";

/**
 * Strategy: a binary operation behind a common contract.
 *
 * The reducer never switches on the operator symbol; it looks the strategy up
 * in the registry. Adding "x²" or "√" later means appending one object here
 * and one entry to OPERATION_STRATEGIES, with no change to the state machine.
 */
export interface OperationStrategy {
  readonly symbol: Operator;
  readonly ariaLabel: string;
  compute(left: number, right: number): number;
}

export const addition: OperationStrategy = {
  symbol: "+",
  ariaLabel: "Somar",
  compute: (left, right) => left + right,
};

export const subtraction: OperationStrategy = {
  symbol: "-",
  ariaLabel: "Subtrair",
  compute: (left, right) => left - right,
};

export const multiplication: OperationStrategy = {
  symbol: "×",
  ariaLabel: "Multiplicar",
  compute: (left, right) => left * right,
};

export const division: OperationStrategy = {
  symbol: "÷",
  ariaLabel: "Dividir",
  // Division by zero yields NaN, which formatDisplay renders as "Erro".
  // That is deliberate: it avoids Infinity leaking into the display.
  compute: (left, right) => (right === 0 ? NaN : left / right),
};

export const OPERATION_STRATEGIES: Record<Operator, OperationStrategy> = {
  "+": addition,
  "-": subtraction,
  "×": multiplication,
  "÷": division,
};

export const getStrategy = (operator: Operator): OperationStrategy =>
  OPERATION_STRATEGIES[operator];

/**
 * Unary strategies operate on a single operand (no pending operator needed).
 * Percent follows the standard calculator convention: 200 + 10% charges 20,
 * so it is a fraction of the stored operand.
 */
export interface UnaryStrategy {
  readonly id: string;
  readonly ariaLabel: string;
  compute(value: number, context: { stored: number | null }): number;
}

export const negation: UnaryStrategy = {
  id: "negate",
  ariaLabel: "Inverter sinal",
  compute: (value) => -value,
};

export const percentage: UnaryStrategy = {
  id: "percent",
  ariaLabel: "Por cento",
  compute: (value, context) => (context.stored ?? 0) * (value / 100),
};

export const UNARY_STRATEGIES: Record<string, UnaryStrategy> = {
  negate: negation,
  percent: percentage,
};
