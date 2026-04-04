import InvoiceDetailView from "@/app/(view)/(pages)/invoices/[id]/invoice-detail.view";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="bg-black min-h-screen">
      <InvoiceDetailView id={id} />
    </main>
  );
}
