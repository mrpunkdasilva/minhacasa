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
  { 
    title: "Faturas", 
    href: "/invoices", 
    icon: Receipt,
    subItems: [
      { title: "Lista", href: "/invoices" },
      { title: "Análises", href: "/invoices/analytics" },
    ]
  },
  { title: "Mercado", href: "/market", icon: ShoppingCart },
  {
    title: "Infraestrutura",
    href: "/infrastructure",
    icon: HardDrive,
  },
  { title: "Lista de Desejos", href: "/wishlist", icon: Heart },
  { title: "Pets", href: "/pets", icon: PawPrint },
  { title: "Limpeza", href: "/cleaning", icon: Sparkles },
];
