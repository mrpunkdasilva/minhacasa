import { getInvoices } from "@/app/infra/actions/invoice.actions";
import { getIncomes } from "@/app/infra/actions/income.actions";
import { AnalyticsView } from "./analytics.view";

export default async function AnalyticsPage() {
  const [invoices, incomes] = await Promise.all([
    getInvoices(),
    getIncomes()
  ]);

  return <AnalyticsView invoices={invoices} incomes={incomes} />;
}
