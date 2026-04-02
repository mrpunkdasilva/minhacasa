import { WishlistItem } from "@/app/domain/entity/wishlist/wishlist-item.entity";
import { WishlistPriority } from "@/app/domain/enums/wishlist/wishlist-priority";
import { WishlistCategory } from "@/app/domain/enums/wishlist/wishlist-category";

const now = new Date();

export const wishlistMock: WishlistItem[] = [
  {
    id: "wi-1",
    createdAt: now,
    updatedAt: now,
    name: "PlayStation 5 Pro",
    price: { amount: 6999.0, currency: "BRL" },
    priority: WishlistPriority.MEDIUM,
    savedAmount: { amount: 2500.0, currency: "BRL" },
    isPurchased: false,
    category: WishlistCategory.ELECTRONICS,
    url: "https://www.sony.com.br/playstation5",
  },
  {
    id: "wi-2",
    createdAt: now,
    updatedAt: now,
    name: "Cadeira Ergonômica Herman Miller",
    price: { amount: 12500.0, currency: "BRL" },
    priority: WishlistPriority.HIGH,
    savedAmount: { amount: 8000.0, currency: "BRL" },
    isPurchased: false,
    category: WishlistCategory.FURNITURE,
  },
  {
    id: "wi-3",
    createdAt: now,
    updatedAt: now,
    name: "Kit de Ferramentas Bosch",
    price: { amount: 450.0, currency: "BRL" },
    priority: WishlistPriority.LOW,
    savedAmount: { amount: 450.0, currency: "BRL" },
    isPurchased: true,
    category: WishlistCategory.TOOLS,
  },
  {
    id: "wi-4",
    createdAt: now,
    updatedAt: now,
    name: "Lâmpadas Inteligentes Philips Hue",
    price: { amount: 890.0, currency: "BRL" },
    priority: WishlistPriority.URGENT,
    savedAmount: { amount: 200.0, currency: "BRL" },
    isPurchased: false,
    category: WishlistCategory.OTHER,
  },
];
