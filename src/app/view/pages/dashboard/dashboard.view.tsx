import { invoicesMock } from "@/app/infra/mocks/invoice/invoice.mock";

export default function DashboardView() {
  const totalInvoices = invoicesMock.reduce((acc, inv) => acc + inv.price, 0);
  const totalPaid = invoicesMock
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + inv.price, 0);
  const totalPending = invoicesMock
    .filter((inv) => inv.status === "unpaid")
    .reduce((acc, inv) => acc + inv.price, 0);
  const totalOverdue = invoicesMock
    .filter((inv) => inv.status === "overdue")
    .reduce((acc, inv) => acc + inv.price, 0);

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tighter mb-8">Visão Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard
          title="Total Geral"
          value={totalInvoices}
          subtitle="Soma de todas as contas"
          color="zinc"
        />
        <SummaryCard
          title="Total Pago"
          value={totalPaid}
          subtitle="Contas liquidadas"
          color="emerald"
        />
        <SummaryCard
          title="Pendente"
          value={totalPending}
          subtitle="Contas a vencer"
          color="amber"
        />
        <SummaryCard
          title="Atrasado"
          value={totalOverdue}
          subtitle="Contas vencidas"
          color="rose"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <p className="text-zinc-400">Gráficos e tendências em breve...</p>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: "zinc" | "emerald" | "amber" | "rose";
}) {
  const colorMap = {
    zinc: "border-zinc-800",
    emerald: "border-emerald-500/50",
    amber: "border-amber-500/50",
    rose: "border-rose-500/50",
  };

  const textColorMap = {
    zinc: "text-white",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    rose: "text-rose-500",
  };

  return (
    <div
      className={`bg-zinc-900 border ${colorMap[color]} rounded-lg p-6 flex flex-col justify-between h-32`}
    >
      <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
        {title}
      </h3>
      <div>
        <span className={`text-2xl font-bold font-mono ${textColorMap[color]}`}>
          {value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
