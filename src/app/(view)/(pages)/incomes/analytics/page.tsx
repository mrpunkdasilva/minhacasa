import { getIncomes } from "@/app/infra/actions/income.actions";
import { IncomesAnalyticsView } from "./incomes-analytics.view";

export default async function IncomesAnalyticsPage() {
  const incomes = await getIncomes();

  return <IncomesAnalyticsView incomes={incomes} />;
}
