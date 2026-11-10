import {
  MarketCategory,
  MarketUnit,
} from "../../enums/market-category/market-category";
import { BaseEntity } from "../base.entity";
import { Money } from "../invoice/invoice.entity";

export type ReceiptProviderId = "sp-sefaz";

export interface ReceiptItem {
  id: string;
  description: string;
  storeCode?: string;
  quantity: number;
  rawUnit: string;
  unit: MarketUnit;
  unitPrice: Money;
  totalPrice: Money;
  category: MarketCategory;
  productKey: string;
}

export interface ReceiptEntity extends BaseEntity {
  houseId: string;
  accessKey: string;
  state: string;
  storeName: string;
  storeCnpj?: string;
  storeAddress?: string;
  issuedAt: Date;
  totalAmount: Money;
  discount?: Money;
  paymentMethod?: string;
  taxAmount?: Money;
  itemCount: number;
  source: "qrcode";
  provider: ReceiptProviderId;
  qrCodeUrl: string;
  items: ReceiptItem[];
}

export interface ParsedReceipt {
  accessKey: string;
  state: string;
  storeName: string;
  storeCnpj?: string;
  storeAddress?: string;
  issuedAt: Date;
  totalAmount: Money;
  discount?: Money;
  paymentMethod?: string;
  taxAmount?: Money;
  itemCount: number;
  provider: ReceiptProviderId;
  qrCodeUrl: string;
  items: ReceiptItem[];
}
