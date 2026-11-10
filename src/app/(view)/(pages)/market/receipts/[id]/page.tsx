import { notFound } from "next/navigation";
import { getReceiptById } from "@/app/infra/actions/receipt.actions";
import MarketPageHeader from "../../components/market-page-header";
import ReceiptDetail from "../../components/receipt-detail";

export default async function MarketReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await getReceiptById(id);

  if (!receipt) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 sm:py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-6 sm:gap-8">
        <MarketPageHeader
          title="Detalhes da Nota"
          description="Tudo o que foi comprado, item por item."
        />

        <ReceiptDetail receipt={receipt} />
      </div>
    </div>
  );
}
