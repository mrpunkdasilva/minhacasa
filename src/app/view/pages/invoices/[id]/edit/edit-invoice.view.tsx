import { getInvoiceById } from "@/app/infra/actions/invoice.actions";
import { CreateInvoiceForm } from "@/app/view/pages/create-invoice/create-invoice-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EditInvoiceViewProps {
  id: string;
}

export default async function EditInvoiceView({ id }: EditInvoiceViewProps) {
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Fatura não encontrada
        </h2>
        <Link
          href="/view/pages/invoices"
          className="text-emerald-500 hover:underline"
        >
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 sm:py-12 px-4 max-w-2xl text-white">
      <Link
        href={`/view/pages/invoices/${id}`}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={14} />
        Voltar para detalhes
      </Link>

      <div className="space-y-2 text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">
          Editar Fatura
        </h1>
        <p className="text-zinc-500 text-sm">
          Altere as informações necessárias abaixo.
        </p>
      </div>

      <CreateInvoiceForm initialData={invoice} />
    </div>
  );
}
