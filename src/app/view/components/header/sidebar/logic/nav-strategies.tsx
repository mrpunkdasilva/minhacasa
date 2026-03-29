import React from "react";
import Link from "next/link";
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/app/view/components/ui/sidebar";
import { NavActionStrategy, NavItem } from "./nav-item";

export class LinkStrategy implements NavActionStrategy {
  constructor(private href: string) {}

  render(item: NavItem, pathname: string): React.ReactNode {
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
}

export class ButtonStrategy implements NavActionStrategy {
  constructor(
    private onClick: () => void,
    private iconOverride?: React.ReactNode,
    private titleOverride?: string,
    private className?: string
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
