import { getInvoices } from "@/app/infra/actions/invoice.actions";
import { getMarketItems } from "@/app/infra/actions/market.actions";
import { getReceipts } from "@/app/infra/actions/receipt.actions";
import MarketPageHeader from "../components/market-page-header";
import MarketAnalysis from "../components/market-analysis";
import { ImportReceiptButton } from "../components/receipt-scanner-dialog";

export default async function MarketAnalysisPage() {
  const [invoices, marketItems, receipts] = await Promise.all([
    getInvoices(),
    getMarketItems(),
    getReceipts(),
  ]);
  const safeItems = Array.isArray(marketItems) ? marketItems : [];
  const safeReceipts = Array.isArray(receipts) ? receipts : [];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <MarketPageHeader
          title="Análise de Gastos"
          description="Onde o dinheiro do mercado está indo mês a mês."
          action={<ImportReceiptButton />}
        />

        <MarketAnalysis
          invoices={invoices}
          marketItems={safeItems}
          receipts={safeReceipts}
        />
      </div>
    </div>
  );
}
