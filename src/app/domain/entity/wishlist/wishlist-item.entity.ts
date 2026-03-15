import { WishlistPriority } from "../../enums/wishlist/wishlist-priority";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  priority: WishlistPriority;
  url?: string;
  savedAmount: number;
  isPurchased: boolean;
  category: string;
}
