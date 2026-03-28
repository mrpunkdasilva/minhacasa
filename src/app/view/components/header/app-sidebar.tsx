"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  HardDrive,
  Heart,
  PawPrint,
  Sparkles,
  PlusCircle,
  Copy,
  Check,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/app/view/components/ui/sidebar";
import LogoComponent from "@/app/view/components/ui/logo/logo";
import { NavUser } from "@/app/view/components/header/nav-user";
import { NavHouse } from "@/app/view/components/header/nav-house";
import { Session } from "next-auth";
import { getInviteLink } from "@/app/infra/actions/house.actions";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Faturas",
    href: "/view/pages/invoices",
    icon: Receipt,
  },
  {
    title: "Mercado",
    href: "/view/pages/market",
    icon: ShoppingCart,
  },
  {
    title: "Infraestrutura",
    href: "/view/pages/infrastructure",
    icon: HardDrive,
  },
  {
    title: "Lista de Desejos",
    href: "/view/pages/wishlist",
    icon: Heart,
  },
  {
    title: "Pets",
    href: "/view/pages/pet",
    icon: PawPrint,
  },
  {
    title: "Limpeza",
    href: "/view/pages/cleaning",
    icon: Sparkles,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session | null;
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    getInviteLink().then(setInviteLink);
  }, []);

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-800" {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-zinc-800">
        <Link href="/">
          <LogoComponent isAnimated={false} w={40} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavHouse />
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Nova Fatura">
                  <Link href="/src/app/view/pages/invoices/new">
                    <PlusCircle className="size-4" />
                    <span>Nova Fatura</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={copyToClipboard}
                  tooltip="Copiar Link de Convite"
                  className="text-zinc-400 hover:text-emerald-500 transition-colors"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  <span>{copied ? "Link Copiado!" : "Convidar Morador"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-zinc-800 p-4">
        <NavUser session={session} />
        <div className="flex items-center gap-2 px-2 pt-2 text-xs text-zinc-500 font-mono">
          <span>v0.1.0</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
