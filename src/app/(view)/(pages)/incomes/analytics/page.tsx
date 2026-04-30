import { getIncomes } from "@/app/infra/actions/income.actions";
import { getInvoices } from "@/app/infra/actions/invoice.actions";
import { IncomesAnalyticsView } from "./incomes-analytics.view";

export default async function IncomesAnalyticsPage() {
  const [incomes, invoices] = await Promise.all([
    getIncomes(),
    getInvoices()
  ]);

  return <IncomesAnalyticsView incomes={incomes} invoices={invoices} />;
}
