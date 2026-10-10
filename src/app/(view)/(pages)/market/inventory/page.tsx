import { getMarketItems } from "@/app/infra/actions/market.actions";
import MarketPageHeader from "../components/market-page-header";
import Inventory from "../components/inventory";

export default async function MarketInventoryPage() {
  const marketItems = await getMarketItems();
  const safeItems = Array.isArray(marketItems) ? marketItems : [];
  const inventoryItems = safeItems.filter((item) => item.isInStock);

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        <MarketPageHeader
          title="Minha Despensa"
          description="O que já está em casa, com controle de estoque."
        />

        <Inventory initialItems={inventoryItems} />
      </div>
    </div>
  );
}
