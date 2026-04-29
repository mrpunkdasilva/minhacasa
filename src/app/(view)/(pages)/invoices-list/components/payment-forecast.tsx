"use client";

import { InvoiceEntity } from "@/app/domain/entity/invoice/invoice.entity";
import { Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentForecastProps {
  invoices: InvoiceEntity[];
}

export function PaymentForecast({ invoices }: PaymentForecastProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate forecast for next 30 days
  const forecast = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    const dayStr = format(date, "dd/MMM", { locale: ptBR });

    const dueThatDay = invoices.filter((inv) => {
      const invDate = new Date(inv.dueDate);
      invDate.setHours(0, 0, 0, 0);
      return invDate.getTime() === date.getTime();
    });

    const amount = dueThatDay.reduce((sum, inv) => sum + inv.price.amount, 0);

    return {
      date: dayStr,
      fullDate: date,
      amount,
      count: dueThatDay.length,
      invoices: dueThatDay,
    };
  }).filter((day) => day.amount > 0);

  // Group by week
  const weeklyForecast = Array.from({ length: 5 }, (_, weekIdx) => {
    const weekStart = addDays(today, weekIdx * 7);
    const weekEnd = addDays(weekStart, 6);
    const weekInvoices = forecast.filter(
      (day) => day.fullDate >= weekStart && day.fullDate <= weekEnd,
    );

    return {
      week: `Semana ${weekIdx + 1}`,
      from: format(weekStart, "dd/MMM", { locale: ptBR }),
      to: format(weekEnd, "dd/MMM", { locale: ptBR }),
      total: weekInvoices.reduce((sum, day) => sum + day.amount, 0),
      count: weekInvoices.reduce((sum, day) => sum + day.count, 0),
    };
  }).filter((week) => week.total > 0);

  // Calculate statistics
  const totalForecast30Days = forecast.reduce(
    (sum, day) => sum + day.amount,
    0,
  );
  const avgPerDay = totalForecast30Days / Math.max(1, forecast.length);
  const maxDay =
    forecast.length > 0 ? Math.max(...forecast.map((d) => d.amount)) : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6 text-zinc-400">
        <Calendar size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Previsão de Pagamentos
        </h3>
      </div>

      {forecast.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">
          Nenhuma fatura programada para os próximos 30 dias.
        </p>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
                Total em 30 dias
              </p>
              <p className="text-lg font-bold text-emerald-500 font-mono">
                {totalForecast30Days.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
                Média por dia
              </p>
              <p className="text-lg font-bold text-blue-500 font-mono">
                {avgPerDay.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">
                Dia com mais picos
              </p>
              <p className="text-lg font-bold text-rose-500 font-mono">
                {maxDay.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>

          {/* Weekly Forecast */}
          {weeklyForecast.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-300 mb-4">
                Previsão por Semana
              </h4>
              {weeklyForecast.map((week, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-white">
                      {week.week}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {week.from} - {week.to} ({week.count} fatura
                      {week.count !== 1 ? "s" : ""})
                    </p>
                  </div>
                  <p className="text-lg font-bold text-emerald-500 font-mono">
                    {week.total.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Daily Details */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <h4 className="text-sm font-bold text-zinc-300 mb-4">
              Próximos Vencimentos
            </h4>
            <div className="space-y-2 max-h-75 overflow-y-auto">
              {forecast.slice(0, 10).map((day, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-800/30 rounded p-3 flex items-center justify-between text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">{day.date}</p>
                    <p className="text-xs text-zinc-500">
                      {day.count} fatura{day.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-amber-500">
                    {day.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


