import { getInvoices } from "@/app/infra/actions/invoice.actions";
import { AnalyticsView } from "./analytics.view";

export default async function AnalyticsPage() {
  const invoices = await getInvoices();

  return <AnalyticsView invoices={invoices} />;
}
