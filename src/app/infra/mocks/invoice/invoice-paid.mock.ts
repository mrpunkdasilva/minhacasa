import { InvoicePaidEntity } from "@/app/domain/entity/invoice-paid/invoice-paid.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Category } from "@/app/domain/enums/category/category";
import { PaymentMethod } from "@/app/domain/enums/payment-method/payment-method";

const now = new Date();

export const invoicePaidMock: InvoicePaidEntity = {
  id: "inv-paid-001",
  createdAt: now,
  updatedAt: now,
  name: "Aluguel",
  dueDate: new Date("2024-03-05"),
  price: { amount: 1200.0, currency: "BRL" },
  description: "Pagamento do aluguel de Março.",
  category: Category.HOUSING,
  status: InvoiceStatus.paid,
  recurrence: { isRecurring: true },
  paidAmount: 1200.0,
  paidAt: new Date("2024-03-04T14:30:00Z"),
  paymentMethod: PaymentMethod.PIX,
  houseId: "house-123",
};

export const invoicesPaidMock: InvoicePaidEntity[] = [
  invoicePaidMock,
  {
    id: "inv-paid-002",
    createdAt: now,
    updatedAt: now,
    name: "Condomínio",
    dueDate: new Date("2024-03-05"),
    price: { amount: 350.0, currency: "BRL" },
    description: "Taxa condominial.",
    category: Category.HOUSING,
    status: InvoiceStatus.paid,
    recurrence: { isRecurring: true },
    paidAmount: 350.0,
    paidAt: new Date("2024-03-05T09:00:00Z"),
    paymentMethod: PaymentMethod.BOLETO,
    houseId: "house-123",
  },
];
