import { getMarketItems } from "@/app/infra/actions/market.actions";
import MarketPageHeader from "../components/market-page-header";
import ShoppingList from "../components/shopping-list";

export default async function MarketShoppingListPage() {
  const marketItems = await getMarketItems();
  const safeItems = Array.isArray(marketItems) ? marketItems : [];
  const shoppingListItems = safeItems.filter((item) => !item.isInStock);

  return (
    <div className="container mx-auto py-6 sm:py-12 px-4 max-w-5xl">
      <div className="flex flex-col gap-6 sm:gap-8">
        <MarketPageHeader
          title="Lista de Compras"
          description="O que falta na despensa, com preço e total da conta."
        />

        <ShoppingList initialItems={shoppingListItems} />
      </div>
    </div>
  );
}
