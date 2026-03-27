import {
  MarketCategory,
  MarketUnit,
} from "../../enums/market-category/market-category";
import { BaseEntity } from "../base.entity";
import { Money } from "../invoice/invoice.entity";

export interface MarketItem extends BaseEntity {
  name: string;
  category: MarketCategory;
  quantity: number;
  minimumQuantity?: number;
  unit: MarketUnit;
  isBought?: boolean;
  isInStock?: boolean;
  expirationDate?: Date;
  lastPrice?: Money;
}
