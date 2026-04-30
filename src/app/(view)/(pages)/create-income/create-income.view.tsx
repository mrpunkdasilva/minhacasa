"use client";

import { CreateIncomeForm } from "./create-income-form";

export function CreateIncomeView() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Nova Entrada
        </h1>
        <p className="text-zinc-500 mt-2">
          Registre uma nova fonte de receita para o seu controle financeiro.
        </p>
      </div>

      <CreateIncomeForm />
    </div>
  );
}
