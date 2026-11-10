"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  Receipt as ReceiptIcon,
  Store,
  Trash2,
} from "lucide-react";
import { ReceiptEntity } from "@/app/domain/entity/receipt/receipt.entity";
import { deleteReceipt } from "@/app/infra/actions/receipt.actions";
import { ImportReceiptButton } from "./receipt-scanner-dialog";

interface ReceiptListProps {
  receipts: ReceiptEntity[];
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReceiptList({ receipts }: ReceiptListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const safeReceipts = Array.isArray(receipts) ? receipts : [];

  const handleDelete = (id: string, storeName: string) => {
    if (
      !confirm(
        `Excluir a nota de "${storeName}"? Os itens da despensa não serão removidos.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      await deleteReceipt(id);
      router.refresh();
    });
  };

  if (safeReceipts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-16 text-center">
        <ReceiptIcon size={48} className="text-zinc-700" />
        <div>
          <p className="font-medium text-zinc-400">
            Nenhuma nota fiscal importada ainda.
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Escaneie o QR Code da nota fiscal paulista para começar.
          </p>
        </div>
        <ImportReceiptButton />
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {safeReceipts.map((receipt) => (
        <div
          key={receipt.id}
          className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Store size={14} className="shrink-0 text-emerald-500" />
              <h3 className="truncate text-lg font-semibold tracking-tight text-white">
                {receipt.storeName}
              </h3>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {formatDate(receipt.issuedAt)}
              </span>
              <span>{receipt.itemCount} itens</span>
              {receipt.paymentMethod && (
                <span className="flex items-center gap-1">
                  <CreditCard size={11} /> {receipt.paymentMethod}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-lg font-black text-emerald-500">
                {formatCurrency(receipt.totalAmount.amount)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                total
              </span>
            </div>

            <Link
              href={`/market/receipts/${receipt.id}`}
              className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-500 hover:text-black"
            >
              Detalhes <ArrowRight size={13} />
            </Link>

            <button
              onClick={() => handleDelete(receipt.id, receipt.storeName)}
              disabled={isPending}
              className="rounded-xl p-2 text-zinc-700 transition-all hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
              title="Excluir nota"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
