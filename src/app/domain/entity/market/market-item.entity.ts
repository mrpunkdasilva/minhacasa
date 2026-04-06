import {
  MarketCategory,
  MarketUnit,
  MarketPriority,
} from "../../enums/market-category/market-category";
import { BaseEntity } from "../base.entity";
import { Money } from "../invoice/invoice.entity";

export interface MarketItem extends BaseEntity {
  houseId: string;
  name: string;
  category: MarketCategory;
  quantity: number;
  minimumQuantity?: number;
  unit: MarketUnit;
  priority?: MarketPriority;
  isBought?: boolean;
  isInStock?: boolean;
  shouldMoveToInventory?: boolean;
  expirationDate?: Date;
  lastPrice?: Money;
}
