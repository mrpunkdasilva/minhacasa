import { getIncomeById } from "@/app/infra/actions/income.actions";
import { EditIncomeView } from "./edit-income.view";
import { notFound } from "next/navigation";

export default async function EditIncomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const income = await getIncomeById(id);

  if (!income) {
    notFound();
  }

  return <EditIncomeView income={income} />;
}
