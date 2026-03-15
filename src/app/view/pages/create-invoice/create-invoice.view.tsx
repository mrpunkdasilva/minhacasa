import { CreateInvoiceForm } from "./create-invoice-form";

export default function CreateInvoicePage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter mb-6">
            Criar Nova Fatura
          </h1>
          <p className="text-muted-foreground">
            Preencha os detalhes abaixo para registrar uma nova despesa ou
            conta.
          </p>
        </div>

        <CreateInvoiceForm />
      </div>
    </main>
  );
}
