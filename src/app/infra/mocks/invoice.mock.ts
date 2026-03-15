import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Category } from "@/app/domain/enums/category/category";

export const invoiceMock: InvoiceEntity = {
  uuid: "inv-001",
  name: "Energia Elétrica",
  dueDate: new Date("2024-03-20"),
  price: 150.50,
  description: "Conta de luz referente ao mês de fevereiro.",
  category: Category.UTILITIES,
  status: InvoiceStatus.unpaid,
  isRecurring: true,
};

export const invoicesMock: InvoiceEntity[] = [
  invoiceMock,
  {
    uuid: "inv-002",
    name: "Internet Fiber",
    dueDate: new Date("2024-03-15"),
    price: 99.90,
    description: "Mensalidade do plano de internet.",
    category: Category.SERVICES,
    status: InvoiceStatus.paid,
    isRecurring: true,
  },
  {
    uuid: "inv-003",
    name: "Supermercado",
    dueDate: new Date("2024-03-10"),
    price: 450.25,
    description: "Compras do mês.",
    category: Category.FOOD,
    status: InvoiceStatus.overdue,
    isRecurring: false,
  }
];
