import {
  MarketCategory,
  MarketUnit,
} from "@/app/domain/enums/market-category/market-category";
import { Money } from "@/app/domain/entity/invoice/invoice.entity";

const STATE_BY_CODE: Record<string, string> = {
  "11": "RO",
  "12": "AC",
  "13": "AM",
  "14": "RR",
  "15": "PA",
  "16": "AP",
  "17": "TO",
  "21": "MA",
  "22": "PI",
  "23": "CE",
  "24": "RN",
  "25": "PB",
  "26": "PE",
  "27": "AL",
  "28": "SE",
  "29": "BA",
  "31": "MG",
  "32": "ES",
  "33": "RJ",
  "35": "SP",
  "41": "PR",
  "42": "SC",
  "43": "RS",
  "50": "MS",
  "51": "MT",
  "52": "GO",
  "53": "DF",
};

const UNIT_MAP: Record<string, MarketUnit> = {
  UN: MarketUnit.UN,
  UND: MarketUnit.UN,
  UNI: MarketUnit.UN,
  UNID: MarketUnit.UN,
  UNIDADE: MarketUnit.UN,
  KG: MarketUnit.KG,
  KILO: MarketUnit.KG,
  QUILO: MarketUnit.KG,
  G: MarketUnit.G,
  GR: MarketUnit.G,
  GRAMA: MarketUnit.G,
  L: MarketUnit.L,
  LT: MarketUnit.L,
  LTS: MarketUnit.L,
  LITRO: MarketUnit.L,
  ML: MarketUnit.ML,
  MLT: MarketUnit.ML,
  PC: MarketUnit.PCT,
  PCT: MarketUnit.PCT,
  PCTE: MarketUnit.PCT,
  PACOTE: MarketUnit.PCT,
  PACK: MarketUnit.PCT,
};

const CATEGORY_KEYWORDS: Array<[MarketCategory, string[]]> = [
  [
    MarketCategory.CLEANING,
    [
      "DETERGENTE",
      "SABAO",
      "AMACIANTE",
      "DESINFETANTE",
      "ALVEJANTE",
      "AGUA SANITARIA",
      "MULTIUSO",
      "LIMPADOR",
      "ESPONJA",
      "SACO DE LIXO",
      "VASSOURA",
      "RODO",
      "PANO",
      "ALCOOL",
      "LAVANDERIA",
      "LIMPA",
    ],
  ],
  [
    MarketCategory.PERSONAL_CARE,
    [
      "SABONETE",
      "SHAMPOO",
      "CONDICIONADOR",
      "CREME DENTAL",
      "PASTA DE DENTE",
      "ESCOVA",
      "DESODORANTE",
      "ABSORVENTE",
      "FRALDA",
      "PAPEL HIGIENICO",
      "LENCO",
      "COTONETE",
      "FIO DENTAL",
      "HIDRATANTE",
      "PROTETOR SOLAR",
      "BARBEAR",
      "LAMINA",
      "HIGIENE",
    ],
  ],
  [
    MarketCategory.MEAT,
    [
      "CARNE",
      "FRANGO",
      "PEIXE",
      "BIFE",
      "PICANHA",
      "ALCATRA",
      "COSTELA",
      "LINGUICA",
      "SALSICHA",
      "PRESUNTO",
      "MORTADELA",
      "SALAME",
      "BACON",
      "LOMBO",
      "COXA",
      "SOBRECOXA",
      "FILE",
      "ACOUGUE",
      "PATE",
      "SEARA",
      "AURORA",
    ],
  ],
  [
    MarketCategory.DAIRY,
    [
      "LEITE",
      "IOG",
      "IOGURTE",
      "QUEIJO",
      "MANTEIGA",
      "MARGARINA",
      "REQUEIJAO",
      "CREME DE LEITE",
      "NATA",
      "LACTEO",
      "COALHADA",
      "DANONE",
      "PETIT",
      "FERM",
    ],
  ],
  [
    MarketCategory.BAKERY,
    [
      "PAO",
      "BOLO",
      "TORRADA",
      "ROSCA",
      "SONHO",
      "BAGUETE",
      "CROISSANT",
      "BISNAGA",
    ],
  ],
  [
    MarketCategory.PRODUCE,
    [
      "FRUTA",
      "BANANA",
      "MACA",
      "LARANJA",
      "UVA",
      "MAMAO",
      "MELANCIA",
      "MELAO",
      "ABACAXI",
      "MORANGO",
      "LIMAO",
      "PERA",
      "MANGA",
      "TOMATE",
      "BATATA",
      "CEBOLA",
      "ALHO",
      "CENOURA",
      "ALFACE",
      "REPOLHO",
      "BROCOLIS",
      "COUVE",
      "ABOBRINHA",
      "PEPINO",
      "PIMENTAO",
      "SALSINHA",
      "COENTRO",
      "BETERRABA",
      "CHUCHU",
      "ABOBORA",
      "MANDIOCA",
      "INHAME",
      "HORTIFRUTI",
    ],
  ],
  [
    MarketCategory.BEVERAGES,
    [
      "COCA",
      "COLA",
      "REFRIGERANTE",
      "SUCO",
      "AGUA",
      "CERVEJA",
      "VINHO",
      "VODKA",
      "WHISKY",
      "ENERGETICO",
      "GUARANA",
      "FANTA",
      "SPRITE",
      "SCHWEPPES",
      "BEBIDA",
      "ISOTONICO",
      "GATORADE",
      "CHA",
    ],
  ],
  [
    MarketCategory.FROZEN,
    [
      "CONGELADO",
      "SORVETE",
      "HAMBURGUER",
      "NUGGETS",
      "PIZZA",
      "LASANHA",
      "BATATA FRITA",
      "POLPA",
      "ACAI",
      "GELO",
    ],
  ],
];

/**
 * Removes accents/punctuation and collapses whitespace. Receipt descriptions
 * are abbreviated and inconsistent between stores, so the key is intentionally
 * aggressive: it is only used to match/aggregate the same product.
 */
export function normalizeProductName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function parseLocaleNumber(value: string): number {
  const cleaned = value
    .replace(/[^\d.,-]/g, "")
    .trim()
    .replace(/\.$/, "");

  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      return Number(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
    }
    return Number(cleaned.replace(/,/g, "")) || 0;
  }

  if (lastComma >= 0) {
    return Number(cleaned.replace(",", ".")) || 0;
  }

  return Number(cleaned) || 0;
}

export function toMoney(value: string | number): Money {
  const amount = typeof value === "number" ? value : parseLocaleNumber(value);
  return { amount, currency: "BRL" };
}

export function mapUnit(rawUnit: string): MarketUnit {
  const key = rawUnit.trim().toUpperCase();
  return UNIT_MAP[key] ?? MarketUnit.UN;
}

export function categorizeProduct(description: string): MarketCategory {
  const normalized = normalizeProductName(description);

  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (
      keywords.some((keyword) =>
        normalized.includes(normalizeProductName(keyword)),
      )
    ) {
      return category;
    }
  }

  return MarketCategory.GROCERY;
}

export function getStateFromAccessKey(accessKey: string): string | null {
  return STATE_BY_CODE[accessKey.slice(0, 2)] ?? null;
}

export function isValidAccessKey(accessKey: string): boolean {
  if (!/^\d{44}$/.test(accessKey)) return false;

  const digits = accessKey.split("").map(Number);
  const checkDigit = digits[43];
  let weight = 2;
  let sum = 0;

  for (let index = 42; index >= 0; index -= 1) {
    sum += digits[index] * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  const remainder = sum % 11;
  const expected = remainder < 2 ? 0 : 11 - remainder;
  return checkDigit === expected;
}

export function parseBrazilianDateTime(value: string): Date | null {
  const match = value.match(
    /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/,
  );
  if (!match) return null;

  const [, day, month, year, hour, minute, second] = match;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function extractAccessKeyFromQrContent(
  qrContent: string,
): string | null {
  const digits = qrContent.replace(/\D/g, "");
  if (digits.length < 44) return null;

  const candidate = digits.slice(0, 44);
  return isValidAccessKey(candidate) ? candidate : null;
}
