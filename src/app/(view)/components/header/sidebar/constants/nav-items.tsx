import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  HardDrive,
  Heart,
  HeartPulse,
  PawPrint,
  Sparkles,
  Wallet,
} from "lucide-react";

export const staticNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    title: "Saúde",
    href: "/health/alerts",
    icon: HeartPulse,
    subItems: [
      { title: "Alertas", href: "/health/alerts" },
      { title: "Medicamentos", href: "/health/medications" },
      { title: "Agenda", href: "/health/appointments" },
    ],
  },
  {
    title: "Faturas",
    href: "/invoices",
    icon: Receipt,
    subItems: [
      { title: "Lista", href: "/invoices" },
      { title: "Análises", href: "/invoices/analytics" },
    ],
  },
  {
    title: "Entradas",
    href: "/incomes",
    icon: Wallet,
    subItems: [
      { title: "Lista", href: "/incomes" },
      { title: "Análises", href: "/incomes/analytics" },
    ],
  },
  {
    title: "Mercado",
    href: "/market/analysis",
    icon: ShoppingCart,
    subItems: [
      { title: "Análise de Gastos", href: "/market/analysis" },
      { title: "Lista de Compras", href: "/market/shopping-list" },
      { title: "Minha Despensa", href: "/market/inventory" },
      { title: "Calculadora", href: "/market/calculator" },
    ],
  },
  {
    title: "Infraestrutura",
    href: "/infrastructure",
    icon: HardDrive,
  },
  { title: "Lista de Desejos", href: "/wishlist", icon: Heart },
  { title: "Pets", href: "/pets", icon: PawPrint },
  { title: "Limpeza", href: "/cleaning", icon: Sparkles },
];
