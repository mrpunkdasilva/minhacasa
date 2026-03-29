"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/app/view/components/ui/sidebar";
import LogoComponent from "@/app/view/components/ui/logo/logo";
import { NavUser } from "./components/nav-user";
import { NavHouse } from "./components/nav-house";
import { Session } from "next-auth";
import { getInviteLink } from "@/app/infra/actions/house.actions";
import { NavItemBuilder } from "./logic/nav-item-builder";
import { staticNavItems } from "./constants/nav-items";
import { Check, Copy, PlusCircle } from "lucide-react";

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

  const navigationItems = staticNavItems.map((item) =>
    NavItemBuilder.create()
      .withTitle(item.title)
      .withIcon(item.icon)
      .withNavigation(item.href)
      .build(),
  );

  const quickActions = [
    NavItemBuilder.create()
      .withTitle("Nova Fatura")
      .withIcon(PlusCircle)
      .withNavigation("/view/pages/invoices/new")
      .withTooltip("Adicionar uma nova conta")
      .build(),
    NavItemBuilder.create()
      .withTitle("Convidar Morador")
      .withIcon(Copy)
      .withAction(
        copyToClipboard,
        copied ? <Check className="size-4 text-emerald-500" /> : undefined,
        copied ? "Link Copiado!" : undefined,
        "text-zinc-400 hover:text-emerald-500 transition-colors",
      )
      .withTooltip("Copiar Link de Convite")
      .build(),
  ];

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
              {navigationItems.map((item) => item.render(pathname))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => action.render(pathname))}
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
