import WishlistView from "@/app/(view)/(pages)/wishlist/wishlist.view";
import { getWishlistItems } from "@/app/infra/actions/wishlist.actions";

export default async function WishlistPage() {
  const items = await getWishlistItems();

  return (
    <main>
      <WishlistView initialItems={items} />
    </main>
  );
}
