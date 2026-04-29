"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { AlertCircle } from "lucide-react";

interface OverdueRiskAnalysisProps {
  invoices: InvoiceEntity[];
}

export function OverdueRiskAnalysis({ invoices }: OverdueRiskAnalysisProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate metrics
  const totalInvoices = invoices.length;
  const overdueCount = invoices.filter(
    (inv) => inv.status === InvoiceStatus.overdue,
  ).length;
  const unpaidCount = invoices.filter(
    (inv) => inv.status === InvoiceStatus.unpaid,
  ).length;

  // Invoices due in the next 7 days
  const nextWeekDue = invoices.filter((inv) => {
    const dueDate = new Date(inv.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return (
      daysUntilDue > 0 &&
      daysUntilDue <= 7 &&
      inv.status === InvoiceStatus.unpaid
    );
  }).length;

  // Calculate probability of delay
  const delayProbability =
    totalInvoices > 0
      ? ((overdueCount + unpaidCount) / totalInvoices) * 100
      : 0;

  // Calculate average days overdue
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === InvoiceStatus.overdue,
  );
  const avgDaysOverdue =
    overdueInvoices.length > 0
      ? overdueInvoices.reduce((sum, inv) => {
          const dueDate = new Date(inv.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const daysOverdue = Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          return sum + Math.max(0, daysOverdue);
        }, 0) / overdueInvoices.length
      : 0;

  // Calculate overdue amount
  const overdueAmount = overdueInvoices.reduce(
    (sum, inv) => sum + inv.price.amount,
    0,
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <AlertCircle size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Análise de Risco
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Probability of Delay */}
        <div className="bg-linear-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/30 rounded-lg p-4">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
            Prob. de Atraso
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-rose-500">
              {delayProbability.toFixed(1)}%
            </p>
            <p className="text-[10px] text-zinc-400">
              de {totalInvoices} faturas
            </p>
          </div>
        </div>

        {/* Overdue Amount */}
        <div className="bg-linear-to-br from-red-500/10 to-red-600/5 border border-red-500/30 rounded-lg p-4">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
            Valor Atrasado
          </p>
          <div className="flex flex-col">
            <p className="text-lg font-bold text-red-500 font-mono">
              {overdueAmount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p className="text-[10px] text-zinc-400">
              {overdueCount} fatura{overdueCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Days Overdue Average */}
        <div className="bg-linear-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-lg p-4">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
            Dias em Atraso
          </p>
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-amber-500">
              {avgDaysOverdue.toFixed(1)}
            </p>
            <p className="text-[10px] text-zinc-400">média</p>
          </div>
        </div>

        {/* Due in Next 7 Days */}
        <div className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-lg p-4">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
            Vence em 7 dias
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-blue-500">{nextWeekDue}</p>
            <p className="text-[10px] text-zinc-400">pendentes</p>
          </div>
        </div>
      </div>

      {/* Risk Level Indicator */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-zinc-300">Nível de Risco</p>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            {delayProbability < 20
              ? "Baixo"
              : delayProbability < 50
                ? "Médio"
                : "Alto"}
          </p>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              delayProbability < 20
                ? "bg-emerald-500 w-[20%]"
                : delayProbability < 50
                  ? "bg-amber-500 w-[50%]"
                  : "bg-rose-500 w-full"
            }`}
          />
        </div>
      </div>

      {/* Insights */}
      {overdueAmount > 0 && (
        <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded text-xs text-red-400">
          <p className="flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>
              Você tem{" "}
              <strong>
                {overdueAmount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>{" "}
              em atrasos. Recomenda-se ação imediata.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

