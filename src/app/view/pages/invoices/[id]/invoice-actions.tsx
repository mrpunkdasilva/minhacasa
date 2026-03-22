"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateInvoiceStatus, archiveInvoice } from "@/app/infra/actions/invoice.actions";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { Loader2, CheckCircle, Archive, Edit3 } from "lucide-react";

interface InvoiceActionsProps {
  uuid: string;
  status: InvoiceStatus;
}

export default function InvoiceActions({ uuid, status }: InvoiceActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isPaid = status === InvoiceStatus.paid;

  const handleTogglePaid = () => {
    const newStatus = isPaid ? InvoiceStatus.unpaid : InvoiceStatus.paid;
    startTransition(async () => {
      await updateInvoiceStatus(uuid, newStatus);
    });
  };

  const handleArchive = () => {
    if (confirm("Tem certeza que deseja arquivar esta fatura? Ela não aparecerá mais na sua lista principal.")) {
      startTransition(async () => {
        await archiveInvoice(uuid);
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={() => router.push(`/view/pages/invoices/${uuid}/edit`)}
          className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base order-2 sm:order-1 flex items-center justify-center gap-2"
          disabled={isPending}
        >
          <Edit3 size={16} />
          Editar
        </button>
        
        <button 
          onClick={handleTogglePaid}
          disabled={isPending}
          className={`w-full font-bold py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base order-1 sm:order-2 flex items-center justify-center gap-2 ${
            isPaid 
              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
              : "bg-emerald-500 hover:bg-emerald-600 text-black"
          }`}
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <CheckCircle size={18} />
              {isPaid ? "Marcar como Pendente" : "Marcar como Pago"}
            </>
          )}
        </button>
      </div>

      <button
        onClick={handleArchive}
        disabled={isPending}
        className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold py-2 sm:py-2.5 rounded-lg transition-colors text-xs flex items-center justify-center gap-2"
      >
        <Archive size={14} />
        Arquivar Fatura
      </button>
    </div>
  );
}
