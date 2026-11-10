import { getReceipts } from "@/app/infra/actions/receipt.actions";
import MarketPageHeader from "../components/market-page-header";
import ReceiptList from "../components/receipt-list";
import { ImportReceiptButton } from "../components/receipt-scanner-dialog";

export default async function MarketReceiptsPage() {
  const receipts = await getReceipts();
  const safeReceipts = Array.isArray(receipts) ? receipts : [];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <MarketPageHeader
          title="Notas Fiscais"
          description="Cupons paulistas importados e o detalhamento de cada compra."
          action={<ImportReceiptButton />}
        />

        <ReceiptList receipts={safeReceipts} />
      </div>
    </div>
  );
}
