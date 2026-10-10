/**
 * Display formatting.
 *
 * Dot as the decimal separator. pt-BR grouping ("1.234,5") is avoided on
 * purpose: a dot must mean "decimal point" here or the display is ambiguous.
 */
export const formatDisplay = (value: number): string => {
  if (!Number.isFinite(value)) return "Erro";
  const rounded = Math.round(value * 1e8) / 1e8;
  return String(rounded);
};

/** Currency formatting for the shopping total, where pt-BR is expected. */
export const formatCurrency = (value: number): string =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
