import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/app/(view)/components/ui/sidebar";
import { NavActionStrategy, NavItem } from "./nav-item";

export class LinkStrategy implements NavActionStrategy {
  constructor(public href: string) {}

  render(item: NavItem, pathname: string): React.ReactNode {
    if (item.subItems) {
      return this.renderCollapsible(item, pathname);
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={pathname === this.href}
          tooltip={item.tooltip || item.title}
        >
          <Link href={this.href}>
            <item.icon className="size-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  private renderCollapsible(item: NavItem, pathname: string): React.ReactNode {
    const isActive =
      pathname === this.href ||
      item.subItems!.some((sub) => pathname === sub.href);

    return (
      <Collapsible.Root
        asChild
        key={item.title}
        defaultOpen={isActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <Collapsible.Trigger asChild>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.tooltip || item.title}
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
              <ChevronDown className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </Collapsible.Trigger>
          <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <SidebarMenuSub>
              {item.subItems!.map((sub) => (
                <SidebarMenuSubItem key={sub.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === sub.href}
                  >
                    <Link href={sub.href}>
                      <span>{sub.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </Collapsible.Content>
        </SidebarMenuItem>
      </Collapsible.Root>
    );
  }
}

export class ButtonStrategy implements NavActionStrategy {
  constructor(
    private onClick: () => void,
    private iconOverride?: React.ReactNode,
    private titleOverride?: string,
    private className?: string,
  ) {}

  render(item: NavItem): React.ReactNode {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          onClick={this.onClick}
          tooltip={item.tooltip || item.title}
          className={this.className}
        >
          {this.iconOverride || <item.icon className="size-4" />}
          <span>{this.titleOverride || item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
}
