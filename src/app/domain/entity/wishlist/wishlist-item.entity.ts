import { WishlistPriority } from "../../enums/wishlist/wishlist-priority";
import { WishlistCategory } from "../../enums/wishlist/wishlist-category";
import { BaseEntity } from "../base.entity";
import { Money } from "../invoice/invoice.entity";

export interface WishlistItem extends BaseEntity {
  name: string;
  price: Money;
  priority: WishlistPriority;
  url?: string;
  savedAmount: Money;
  isPurchased: boolean;
  category: WishlistCategory;
}
