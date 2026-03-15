import { WishlistItem } from "@/app/domain/entity/wishlist/wishlist-item.entity";
import { WishlistPriority } from "@/app/domain/enums/wishlist/wishlist-priority";

export const wishlistMock: WishlistItem[] = [
  {
    id: "wi-1",
    name: "PlayStation 5 Pro",
    price: 6999.0,
    priority: WishlistPriority.MEDIUM,
    savedAmount: 2500.0,
    isPurchased: false,
    category: "Eletrônicos",
    url: "https://www.sony.com.br/playstation5",
  },
  {
    id: "wi-2",
    name: "Cadeira Ergonômica Herman Miller",
    price: 12500.0,
    priority: WishlistPriority.HIGH,
    savedAmount: 8000.0,
    isPurchased: false,
    category: "Móveis",
  },
  {
    id: "wi-3",
    name: "Kit de Ferramentas Bosch",
    price: 450.0,
    priority: WishlistPriority.LOW,
    savedAmount: 450.0,
    isPurchased: true,
    category: "Manutenção",
  },
  {
    id: "wi-4",
    name: "Lâmpadas Inteligentes Philips Hue",
    price: 890.0,
    priority: WishlistPriority.URGENT,
    savedAmount: 200.0,
    isPurchased: false,
    category: "Automação",
  },
];
