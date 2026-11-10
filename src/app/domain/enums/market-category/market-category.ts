export enum MarketCategory {
  PRODUCE = "Hortifruti",
  MEAT = "Açougue",
  DAIRY = "Laticínios",
  BAKERY = "Padaria",
  CLEANING = "Limpeza",
  PERSONAL_CARE = "Higiene Pessoal",
  GROCERY = "Mercearia",
  BEVERAGES = "Bebidas",
  FROZEN = "Congelados",
}

export enum MarketUnit {
  UN = "Unidade",
  KG = "Quilograma (kg)",
  G = "Grama (g)",
  L = "Litro (l)",
  ML = "Mililitro (ml)",
  PCT = "Pacote",
}

export const MarketUnitAbbreviation: Record<MarketUnit, string> = {
  [MarketUnit.UN]: "un",
  [MarketUnit.KG]: "kg",
  [MarketUnit.G]: "g",
  [MarketUnit.L]: "l",
  [MarketUnit.ML]: "ml",
  [MarketUnit.PCT]: "pct",
};

export enum MarketPriority {
  LOW = "Baixa",
  MEDIUM = "Média",
  HIGH = "Alta",
  URGENT = "Urgente",
}
