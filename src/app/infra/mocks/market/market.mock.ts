import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import {
  MarketCategory,
  MarketUnit,
} from "@/app/domain/enums/market-category/market-category";

const now = new Date();

export const shoppingListMock: MarketItem[] = [
  {
    id: "sl-1",
    createdAt: now,
    updatedAt: now,
    name: "Arroz Tio João",
    category: MarketCategory.GROCERY,
    quantity: 1,
    unit: MarketUnit.PCT,
    isBought: false,
    lastPrice: { amount: 25.9, currency: "BRL" },
  },
  {
    id: "sl-2",
    createdAt: now,
    updatedAt: now,
    name: "Leite Integral",
    category: MarketCategory.DAIRY,
    quantity: 12,
    unit: MarketUnit.UN,
    isBought: true,
    lastPrice: { amount: 4.5, currency: "BRL" },
  },
  {
    id: "sl-3",
    createdAt: now,
    updatedAt: now,
    name: "Detergente",
    category: MarketCategory.CLEANING,
    quantity: 3,
    unit: MarketUnit.UN,
    isBought: false,
    lastPrice: { amount: 2.2, currency: "BRL" },
  },
];

export const inventoryMock: MarketItem[] = [
  {
    id: "inv-1",
    createdAt: now,
    updatedAt: now,
    name: "Feijão Carioca",
    category: MarketCategory.GROCERY,
    quantity: 2,
    unit: MarketUnit.PCT,
    isInStock: true,
    expirationDate: new Date("2024-12-30"),
  },
  {
    id: "inv-2",
    createdAt: now,
    updatedAt: now,
    name: "Iogurte Natural",
    category: MarketCategory.DAIRY,
    quantity: 1,
    unit: MarketUnit.UN,
    isInStock: true,
    expirationDate: new Date("2024-03-25"), // Vencendo logo
  },
  {
    id: "inv-3",
    createdAt: now,
    updatedAt: now,
    name: "Peito de Frango",
    category: MarketCategory.MEAT,
    quantity: 1.5,
    unit: MarketUnit.KG,
    isInStock: true,
    expirationDate: new Date("2024-03-18"), // Vencendo logo
  },
];
