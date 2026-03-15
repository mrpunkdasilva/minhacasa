import { MarketCategory } from "../../enums/market-category/market-category";

export interface MarketItem {
  id: string;
  name: string;
  category: MarketCategory;
  quantity: number;
  unit: "un" | "kg" | "g" | "l" | "ml" | "pct";
  isBought?: boolean; // For Shopping List
  isInStock?: boolean; // For Inventory
  expirationDate?: Date; // For Inventory
  lastPrice?: number;
}
