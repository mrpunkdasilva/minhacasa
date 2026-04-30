"use client";

import { IncomeEntity } from "@/app/domain/entity/income/income.entity";
import { CreateIncomeForm } from "@/app/(view)/(pages)/create-income/create-income-form";

interface EditIncomeViewProps {
  income: IncomeEntity;
}

export function EditIncomeView({ income }: EditIncomeViewProps) {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Editar Entrada
        </h1>
        <p className="text-zinc-500 mt-2">
          Atualize as informações da sua fonte de receita.
        </p>
      </div>

      <CreateIncomeForm initialData={income} />
    </div>
  );
}
