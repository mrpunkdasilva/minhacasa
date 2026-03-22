import EditInvoiceView from "@/app/view/pages/invoices/[id]/edit/edit-invoice.view";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="bg-black min-h-screen">
      <EditInvoiceView uuid={id} />
    </main>
  );
}
