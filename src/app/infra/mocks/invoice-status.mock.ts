import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";

export const invoiceStatusMocks: InvoiceStatus[] = [
  InvoiceStatus.unpaid,
  InvoiceStatus.paid,
  InvoiceStatus.overdue,
  InvoiceStatus.scheduled,
];
