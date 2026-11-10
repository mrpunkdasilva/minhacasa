"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Receipt as ReceiptIcon,
  Store,
  Trash2,
} from "lucide-react";
import { ReceiptEntity } from "@/app/domain/entity/receipt/receipt.entity";
import { deleteReceipt } from "@/app/infra/actions/receipt.actions";

interface ReceiptDetailProps {
  receipt: ReceiptEntity;
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

export default function ReceiptDetail({ receipt }: ReceiptDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        `Excluir a nota de "${receipt.storeName}"? Os itens da despensa não serão removidos.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      await deleteReceipt(receipt.id);
      router.push("/market/receipts");
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/market/receipts"
          className="flex items-center gap-2 text-xs font-bold text-zinc-500 transition-colors hover:text-emerald-500"
        >
          <ArrowLeft size={16} /> Voltar para notas
        </Link>

        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-500 transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
        >
          <Trash2 size={14} /> Excluir nota
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Store size={18} className="text-emerald-500" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {receipt.storeName}
              </h2>
            </div>
            {receipt.storeCnpj && (
              <p className="mt-1 text-xs text-zinc-500">
                CNPJ {receipt.storeCnpj}
              </p>
            )}
            {receipt.storeAddress && (
              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <MapPin size={12} /> {receipt.storeAddress}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="block text-3xl font-black text-emerald-500">
              {formatCurrency(receipt.totalAmount.amount)}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
              {receipt.itemCount} itens
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-600">
              Emissão
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs font-bold text-white">
              <Calendar size={12} className="text-emerald-500" />{" "}
              {formatDate(receipt.issuedAt)}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-600">
              Pagamento
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs font-bold text-white">
              <CreditCard size={12} className="text-emerald-500" />{" "}
              {receipt.paymentMethod ?? "Não informado"}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-600">
              Estado
            </span>
            <span className="mt-1 text-xs font-bold text-white">
              {receipt.state}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-600">
              Desconto
            </span>
            <span className="mt-1 text-xs font-bold text-white">
              {receipt.discount ? formatCurrency(receipt.discount.amount) : "—"}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-black/40 p-3">
          <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-600">
            Chave de acesso
          </span>
          <span className="mt-1 block break-all font-mono text-[10px] text-zinc-400">
            {receipt.accessKey}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-800/20 p-5">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
            <ReceiptIcon size={16} className="text-emerald-500" /> Itens da nota
          </h3>
          <span className="text-[10px] font-bold text-zinc-500">
            {receipt.items.length} itens
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-800 bg-black/40 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4 text-center">Qtd.</th>
                <th className="px-5 py-4 text-right">Unitário</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4 text-center">Categoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {receipt.items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-zinc-800/30"
                >
                  <td className="px-5 py-4">
                    <span className="block text-sm font-bold text-white">
                      {item.description}
                    </span>
                    {item.storeCode && (
                      <span className="text-[10px] text-zinc-600">
                        Código {item.storeCode}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center text-xs font-bold text-zinc-300">
                    {item.quantity}{" "}
                    <span className="text-[9px] uppercase text-zinc-600">
                      {item.rawUnit}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-xs text-zinc-400">
                    {formatCurrency(item.unitPrice.amount)}
                  </td>
                  <td className="px-5 py-4 text-right text-xs font-black text-white">
                    {formatCurrency(item.totalPrice.amount)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-tighter text-emerald-500">
                      {item.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
