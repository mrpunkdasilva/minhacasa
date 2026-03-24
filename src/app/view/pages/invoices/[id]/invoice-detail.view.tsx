import { getInvoiceByUuid } from "@/app/infra/actions/invoice.actions";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Repeat,
} from "lucide-react";
import InvoiceActions from "@/app/view/pages/invoices/[id]/invoice-actions";

interface InvoiceDetailViewProps {
  uuid: string;
}

export default async function InvoiceDetailView({
  uuid,
}: InvoiceDetailViewProps) {
  const invoice = await getInvoiceByUuid(uuid);

  if (!invoice) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          Fatura não encontrada
        </h2>
        <Link
          href="/view/pages/invoices"
          className="text-emerald-500 hover:underline text-sm"
        >
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-12 px-4 max-w-3xl text-white">
      <Link
        href="/view/pages/invoices"
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 sm:mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={14} />
        Voltar para faturas
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-zinc-800/50 p-5 sm:p-8 border-b border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase ${
                  invoice.status === InvoiceStatus.paid
                    ? "bg-emerald-500/20 text-emerald-500"
                    : invoice.status === InvoiceStatus.overdue
                      ? "bg-rose-500/20 text-rose-500"
                      : "bg-amber-500/20 text-amber-500"
                }`}
              >
                {getStatusLabel(invoice.status)}
              </span>
              <h1 className="text-xl sm:text-3xl font-bold mt-2 sm:mt-3 tracking-tighter">
                {invoice.name}
              </h1>
            </div>
            <div className="text-left sm:text-right border-t border-zinc-800 sm:border-0 pt-3 sm:pt-0">
              <p className="text-zinc-500 text-[9px] sm:text-xs uppercase tracking-widest font-bold">
                Valor
              </p>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-500">
                {invoice.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            <InfoItem
              icon={<Calendar size={18} />}
              label="Vencimento"
              value={new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
            />
            <InfoItem
              icon={<Tag size={18} />}
              label="Categoria"
              value={invoice.category}
            />
            <InfoItem
              icon={<Repeat size={18} />}
              label="Recorrente"
              value={invoice.isRecurring ? "Sim" : "Não"}
            />
            <InfoItem
              icon={<DollarSign size={18} />}
              label="Status"
              value={getStatusLabel(invoice.status)}
            />
          </div>

          {invoice.description && (
            <div className="border-t border-zinc-800 pt-6 sm:pt-8">
              <div className="flex items-center gap-2 text-zinc-400 mb-2 sm:mb-3">
                <FileText size={16} />
                <span className="text-[10px] sm:text-sm font-bold uppercase tracking-wider">
                  Descrição
                </span>
              </div>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed bg-zinc-800/30 p-3 sm:p-4 rounded-lg">
                {invoice.description}
              </p>
            </div>
          )}

          <InvoiceActions uuid={invoice.uuid} status={invoice.status} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center sm:items-start gap-3 sm:gap-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-800 rounded flex items-center justify-center text-zinc-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-zinc-500 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-0.5 sm:mb-1">
          {label}
        </p>
        <p className="text-white text-sm sm:text-base font-medium">{value}</p>
      </div>
    </div>
  );
}

function getStatusLabel(status: InvoiceStatus) {
  switch (status) {
    case InvoiceStatus.paid:
      return "Pago";
    case InvoiceStatus.unpaid:
      return "Pendente";
    case InvoiceStatus.overdue:
      return "Atrasado";
    case InvoiceStatus.scheduled:
      return "Agendado";
    default:
      return status;
  }
}
