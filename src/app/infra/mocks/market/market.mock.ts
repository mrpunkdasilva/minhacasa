import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import { MarketCategory } from "@/app/domain/enums/market-category/market-category";

export const shoppingListMock: MarketItem[] = [
  {
    id: "sl-1",
    name: "Arroz Tio João",
    category: MarketCategory.GROCERY,
    quantity: 1,
    unit: "pct",
    isBought: false,
    lastPrice: 25.90,
  },
  {
    id: "sl-2",
    name: "Leite Integral",
    category: MarketCategory.DAIRY,
    quantity: 12,
    unit: "un",
    isBought: true,
    lastPrice: 4.50,
  },
  {
    id: "sl-3",
    name: "Detergente",
    category: MarketCategory.CLEANING,
    quantity: 3,
    unit: "un",
    isBought: false,
    lastPrice: 2.20,
  }
];

export const inventoryMock: MarketItem[] = [
  {
    id: "inv-1",
    name: "Feijão Carioca",
    category: MarketCategory.GROCERY,
    quantity: 2,
    unit: "pct",
    isInStock: true,
    expirationDate: new Date("2024-12-30"),
  },
  {
    id: "inv-2",
    name: "Iogurte Natural",
    category: MarketCategory.DAIRY,
    quantity: 1,
    unit: "un",
    isInStock: true,
    expirationDate: new Date("2024-03-25"), // Vencendo logo
  },
  {
    id: "inv-3",
    name: "Peito de Frango",
    category: MarketCategory.MEAT,
    quantity: 1.5,
    unit: "kg",
    isInStock: true,
    expirationDate: new Date("2024-03-18"), // Vencendo logo
  }
];
