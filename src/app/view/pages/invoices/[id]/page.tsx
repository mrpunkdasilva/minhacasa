import Header from "@/app/view/components/header/header";

export default function EditInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="bg-black min-h-screen">
      <Header />
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold tracking-tighter mb-6 text-center">
          Editar Fatura: {params.id}
        </h1>
        <p className="text-muted-foreground text-center">
          Formulário de edição virá aqui.
        </p>
      </div>
    </main>
  );
}
