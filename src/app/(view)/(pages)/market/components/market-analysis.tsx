"use client";

import { Category } from "@/app/domain/enums/category/category";
import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { InvoiceStatus } from "@/app/domain/enums/invoice-status/invoice-status";
import { MarketItem } from "@/app/domain/entity/market/market-item.entity";
import {
  MarketUnit,
  MarketUnitAbbreviation,
} from "@/app/domain/enums/market-category/market-category";
import { ReceiptEntity } from "@/app/domain/entity/receipt/receipt.entity";
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
  ShoppingCart,
  Package,
  ReceiptText,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface MarketAnalysisProps {
  invoices: InvoiceEntity[];
  marketItems: MarketItem[];
  receipts: ReceiptEntity[];
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatReceiptDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function MarketAnalysis({
  invoices,
  marketItems,
  receipts,
}: MarketAnalysisProps) {
  // --- INVOICE METRICS ---
  const marketExpenses = useMemo(
    () =>
      invoices.filter(
        (inv) =>
          inv.category === Category.FOOD || inv.category === Category.MARKET,
      ),
    [invoices],
  );

  const totalMarketSpent = marketExpenses.reduce(
    (acc, inv) => acc + inv.price.amount,
    0,
  );

  const currentMonth = new Date().getMonth();
  const currentMonthExpenses = marketExpenses.filter(
    (inv) => new Date(inv.dueDate).getMonth() === currentMonth,
  );
  const totalCurrentMonth = currentMonthExpenses.reduce(
    (acc, inv) => acc + inv.price.amount,
    0,
  );

  // --- MARKET ITEM METRICS ---
  const lowStockItems = useMemo(
    () =>
      marketItems.filter(
        (item) =>
          item.isInStock &&
          item.minimumQuantity !== undefined &&
          item.quantity <= item.minimumQuantity,
      ),
    [marketItems],
  );

  const expiringSoonItems = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return marketItems.filter(
      (item) =>
        item.isInStock &&
        item.expirationDate &&
        new Date(item.expirationDate) <= nextWeek &&
        new Date(item.expirationDate) >= today,
    );
  }, [marketItems]);

  const estimatedShoppingTotal = useMemo(
    () =>
      marketItems
        .filter((item) => !item.isInStock && !item.isBought && item.lastPrice)
        .reduce(
          (acc, item) => acc + (item.lastPrice?.amount || 0) * item.quantity,
          0,
        ),
    [marketItems],
  );

  // --- RECEIPT METRICS ---
  const receiptMetrics = useMemo(() => {
    const safeReceipts = Array.isArray(receipts) ? receipts : [];
    const totalSpent = safeReceipts.reduce(
      (acc, receipt) => acc + receipt.totalAmount.amount,
      0,
    );
    const itemCount = safeReceipts.reduce(
      (acc, receipt) => acc + receipt.itemCount,
      0,
    );

    const categoryTotals = new Map<string, number>();
    for (const receipt of safeReceipts) {
      for (const item of receipt.items) {
        categoryTotals.set(
          item.category,
          (categoryTotals.get(item.category) ?? 0) + item.totalPrice.amount,
        );
      }
    }

    const topCategories = Array.from(categoryTotals.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const recent = [...safeReceipts]
      .sort(
        (a, b) =>
          new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
      )
      .slice(0, 5);

    return {
      totalSpent,
      itemCount,
      topCategories,
      recent,
      count: safeReceipts.length,
    };
  }, [receipts]);

  const maxCategoryTotal = receiptMetrics.topCategories[0]?.[1] ?? 0;

  return (
    <div className="space-y-10">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gastos (Mês)"
          value={totalCurrentMonth}
          subtitle={`${currentMonthExpenses.length} compras`}
          type="currency"
          color="emerald"
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          title="Estoque Crítico"
          value={lowStockItems.length}
          subtitle="Itens abaixo do mínimo"
          type="number"
          color="amber"
          icon={<AlertTriangle size={18} />}
        />
        <MetricCard
          title="Vencendo Logo"
          value={expiringSoonItems.length}
          subtitle="Próximos 7 dias"
          type="number"
          color="rose"
          icon={<Calendar size={18} />}
        />
        <MetricCard
          title="Est. Lista"
          value={estimatedShoppingTotal}
          subtitle="Custo da lista atual"
          type="currency"
          color="zinc"
          icon={<ShoppingCart size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Urgent Alerts Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Alertas de
            Atenção
          </h3>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            {lowStockItems.length === 0 && expiringSoonItems.length === 0 ? (
              <p className="text-zinc-500 text-center py-10">
                Tudo sob controle na sua despensa! ✨
              </p>
            ) : (
              <>
                {lowStockItems.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-amber-500 uppercase mb-3">
                      Estoque Baixo
                    </p>
                    <div className="space-y-2">
                      {lowStockItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-zinc-800/50"
                        >
                          <span className="text-sm font-medium text-white">
                            {item.name}
                          </span>
                          <span className="text-xs font-bold text-zinc-500">
                            {item.quantity}{" "}
                            {MarketUnitAbbreviation[item.unit as MarketUnit] ??
                              item.unit.split(" ")[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {expiringSoonItems.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-rose-500 uppercase mb-3">
                      Vencendo em Breve
                    </p>
                    <div className="space-y-2">
                      {expiringSoonItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-zinc-800/50"
                        >
                          <span className="text-sm font-medium text-white">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-black text-rose-500">
                            {new Date(item.expirationDate!).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Categories Overview */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Package size={16} /> Resumo por Categoria
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="space-y-4">
              {/* Simplified distribution representation */}
              {Array.from(new Set(marketItems.map((i) => i.category)))
                .slice(0, 5)
                .map((cat) => {
                  const count = marketItems.filter(
                    (i) => i.category === cat,
                  ).length;
                  const percentage = (count / marketItems.length) * 100;
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-300 font-medium">{cat}</span>
                        <span className="text-zinc-500 font-bold">
                          {count} itens
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500/60 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Analytics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-500">
            <ReceiptText size={16} className="text-emerald-500" /> Notas Fiscais
          </h3>
          <Link
            href="/market/receipts"
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline"
          >
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Gasto em cupons
            </span>
            <span className="mt-2 block text-2xl font-black font-mono text-emerald-500">
              {formatCurrency(receiptMetrics.totalSpent)}
            </span>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Itens comprados
            </span>
            <span className="mt-2 block text-2xl font-black font-mono text-white">
              {receiptMetrics.itemCount}
            </span>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Cupons importados
            </span>
            <span className="mt-2 block text-2xl font-black font-mono text-white">
              {receiptMetrics.count}
            </span>
          </div>
        </div>

        {receiptMetrics.recent.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="mb-4 text-xs font-bold uppercase text-zinc-500">
                Onde você mais gastou
              </p>
              <div className="space-y-3">
                {receiptMetrics.topCategories.map(([category, amount]) => (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-zinc-300">
                        {category}
                      </span>
                      <span className="font-bold text-zinc-500">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black">
                      <div
                        className="h-full rounded-full bg-emerald-500/60"
                        style={{
                          width: `${maxCategoryTotal > 0 ? (amount / maxCategoryTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="mb-4 text-xs font-bold uppercase text-zinc-500">
                Últimos cupons
              </p>
              <div className="space-y-2">
                {receiptMetrics.recent.map((receipt) => (
                  <Link
                    key={receipt.id}
                    href={`/market/receipts/${receipt.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-black/40 p-3 transition-colors hover:border-emerald-500/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">
                        {receipt.storeName}
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        {formatReceiptDate(receipt.issuedAt)} •{" "}
                        {receipt.itemCount} itens
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-black text-emerald-500">
                      {formatCurrency(receipt.totalAmount.amount)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center">
            <p className="text-sm text-zinc-500">
              Importe sua primeira nota fiscal para ver as estatísticas.
            </p>
          </div>
        )}
      </div>

      {/* Historical Purchases Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Histórico de Gastos
          </h3>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-black">
            TOTAL:{" "}
            {totalMarketSpent.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-zinc-500 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {marketExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-zinc-500 italic"
                  >
                    Nenhuma fatura registrada ainda.
                  </td>
                </tr>
              ) : (
                marketExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-xs font-bold text-zinc-400 font-mono">
                      {new Date(expense.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">
                      {expense.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-white">
                      {expense.price.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                          expense.status === InvoiceStatus.paid
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {expense.status === InvoiceStatus.paid
                          ? "PAGO"
                          : "PENDENTE"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
type MetricColor = keyof typeof metricColors;

const metricColors = {
  emerald: "text-emerald-500 border-emerald-500/20 shadow-emerald-500/5",
  amber: "text-amber-500 border-amber-500/20 shadow-amber-500/5",
  rose: "text-rose-500 border-rose-500/20 shadow-rose-500/5",
  zinc: "text-white border-zinc-800 shadow-white/5",
} as const;

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  type: "currency" | "number";
  color: MetricColor;
  icon: React.ReactNode;
}

function MetricCard({
  title,
  value,
  subtitle,
  type,
  color,
  icon,
}: MetricCardProps) {
  const formattedValue =
    type === "currency"
      ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : value;

  return (
    <div
      className={`bg-zinc-900 border ${metricColors[color]} rounded-2xl p-5 flex flex-col justify-between h-36 transition-all hover:scale-[1.02] shadow-xl`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
          {title}
        </h3>
        <div
          className={`p-2 bg-black/40 rounded-lg ${metricColors[color].split(" ")[0]}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <span
          className={`text-2xl font-black font-mono leading-none ${metricColors[color].split(" ")[0]}`}
        >
          {formattedValue}
        </span>
        <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
