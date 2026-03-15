import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { PaymentMethod } from "@/app/domain/enums/payment-method/payment-method";

export interface InvoicePaidEntity extends InvoiceEntity {
  paidAmount: number;
  paidAt: Date;
  paymentMethod: PaymentMethod;
}
