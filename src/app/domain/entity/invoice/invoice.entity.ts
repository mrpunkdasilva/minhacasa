import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Category } from "@/app/domain/enums/category/category";

export interface InvoiceEntity {
  uuid: string;
  name: string;
  dueDate: Date;
  price: number;
  description: string;
  category: Category;
  status: InvoiceStatus;
  isRecurring: boolean;
}
