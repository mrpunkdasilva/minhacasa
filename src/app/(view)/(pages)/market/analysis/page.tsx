import { getInvoices } from "@/app/infra/actions/invoice.actions";
import { getMarketItems } from "@/app/infra/actions/market.actions";
import MarketPageHeader from "../components/market-page-header";
import MarketAnalysis from "../components/market-analysis";

export default async function MarketAnalysisPage() {
  const [invoices, marketItems] = await Promise.all([
    getInvoices(),
    getMarketItems(),
  ]);
  const safeItems = Array.isArray(marketItems) ? marketItems : [];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <MarketPageHeader
          title="Análise de Gastos"
          description="Onde o dinheiro do mercado está indo mês a mês."
        />

        <MarketAnalysis invoices={invoices} marketItems={safeItems} />
      </div>
    </div>
  );
}
