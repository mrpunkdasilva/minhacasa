import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Category } from "@/app/domain/enums/category/category";
import { BaseEntity } from "../base.entity";

export interface Money {
  amount: number;
  currency: "BRL" | "USD" | "EUR";
}

export interface RecurrenceInfo {
  isRecurring: boolean;
  frequency?: "weekly" | "monthly" | "yearly";
  interval?: number;
  endDate?: Date;
}

export interface InvoiceEntity extends BaseEntity {
  name: string;
  dueDate: Date;
  price: Money;
  description: string;
  category: Category;
  status: InvoiceStatus;
  recurrence: RecurrenceInfo;
  isArchived?: boolean;
  houseUuid: string; // The house this invoice belongs to
  ownerUuid?: string; // If set, it's a private invoice for this user
}
