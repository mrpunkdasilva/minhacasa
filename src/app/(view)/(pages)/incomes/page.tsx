import { getIncomes } from "@/app/infra/actions/income.actions";
import { IncomesView } from "./incomes.view";

export default async function IncomesPage() {
  const incomes = await getIncomes();

  return <IncomesView incomes={incomes} />;
}
