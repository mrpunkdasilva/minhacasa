import { BaseEntity } from "../base.entity";
import { Money, RecurrenceInfo } from "../invoice/invoice.entity";

export enum IncomeCategory {
  SALARY = "Salário",
  FREELANCE = "Freelance",
  INVESTMENT = "Investimento",
  GIFT = "Presente",
  OTHER = "Outros",
}

export interface IncomeEntity extends BaseEntity {
  name: string;
  date: Date;
  amount: Money;
  description: string;
  category: IncomeCategory;
  recurrence: RecurrenceInfo;
  houseId: string;
  ownerId?: string;
}
