import { InvoicePaidEntity } from "@/app/domain/entity/invoice-paid/invoice-paid.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Category } from "@/app/domain/enums/category/category";
import { PaymentMethod } from "@/app/domain/enums/payment-method/payment-method";

export const invoicePaidMock: InvoicePaidEntity = {
  uuid: "inv-paid-001",
  name: "Aluguel",
  dueDate: new Date("2024-03-05"),
  price: 1200.00,
  description: "Pagamento do aluguel de Março.",
  category: Category.HOUSING,
  status: InvoiceStatus.paid,
  isRecurring: true,
  paidAmount: 1200.00,
  paidAt: new Date("2024-03-04T14:30:00Z"),
  paymentMethod: PaymentMethod.PIX,
};

export const invoicesPaidMock: InvoicePaidEntity[] = [
    invoicePaidMock,
    {
        uuid: "inv-paid-002",
        name: "Condomínio",
        dueDate: new Date("2024-03-05"),
        price: 350.00,
        description: "Taxa condominial.",
        category: Category.HOUSING,
        status: InvoiceStatus.paid,
        isRecurring: true,
        paidAmount: 350.00,
        paidAt: new Date("2024-03-05T09:00:00Z"),
        paymentMethod: PaymentMethod.BOLETO,
    }
];
