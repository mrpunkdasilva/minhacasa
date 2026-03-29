import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  HardDrive,
  Heart,
  PawPrint,
  Sparkles,
} from "lucide-react";

export const staticNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Faturas", href: "/view/pages/invoices", icon: Receipt },
  { title: "Mercado", href: "/view/pages/market", icon: ShoppingCart },
  {
    title: "Infraestrutura",
    href: "/view/pages/infrastructure",
    icon: HardDrive,
  },
  { title: "Lista de Desejos", href: "/view/pages/wishlist", icon: Heart },
  { title: "Pets", href: "/view/pages/pet", icon: PawPrint },
  { title: "Limpeza", href: "/view/pages/cleaning", icon: Sparkles },
];
