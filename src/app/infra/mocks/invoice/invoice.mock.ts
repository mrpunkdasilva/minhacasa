import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Category } from "@/app/domain/enums/category/category";

const now = new Date();

export const invoiceMock: InvoiceEntity = {
  id: "inv-001",
  createdAt: now,
  updatedAt: now,
  name: "Energia Elétrica",
  dueDate: new Date("2024-03-20"),
  price: { amount: 150.5, currency: "BRL" },
  description: "Conta de luz referente ao mês de fevereiro.",
  category: Category.UTILITIES,
  status: InvoiceStatus.unpaid,
  recurrence: { isRecurring: true },
  houseId: "house-123",
};

export const invoicesMock: InvoiceEntity[] = [
  invoiceMock,
  {
    id: "inv-002",
    createdAt: now,
    updatedAt: now,
    name: "Internet Fiber",
    dueDate: new Date("2024-03-15"),
    price: { amount: 99.9, currency: "BRL" },
    description: "Mensalidade do plano de internet.",
    category: Category.SERVICES,
    status: InvoiceStatus.paid,
    recurrence: { isRecurring: true },
    houseId: "house-123",
  },
  {
    id: "inv-003",
    createdAt: now,
    updatedAt: now,
    name: "Supermercado",
    dueDate: new Date("2024-03-10"),
    price: { amount: 450.25, currency: "BRL" },
    description: "Compras do mês.",
    category: Category.FOOD,
    status: InvoiceStatus.overdue,
    recurrence: { isRecurring: false },
    houseId: "house-123",
  },
];
