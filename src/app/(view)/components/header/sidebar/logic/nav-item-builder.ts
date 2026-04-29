import { LucideIcon, LayoutDashboard } from "lucide-react";
import React from "react";
import { NavItem, NavActionStrategy, NavSubItem } from "./nav-item";
import { LinkStrategy, ButtonStrategy } from "./nav-strategies";

export class NavItemBuilder {
  private title: string = "";
  private icon: LucideIcon = LayoutDashboard;
  private strategy!: NavActionStrategy;
  private tooltip?: string;
  private subItems: NavSubItem[] = [];

  static create() {
    return new NavItemBuilder();
  }

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withIcon(icon: LucideIcon) {
    this.icon = icon;
    return this;
  }

  withTooltip(tooltip: string) {
    this.tooltip = tooltip;
    return this;
  }

  withNavigation(href: string) {
    this.strategy = new LinkStrategy(href);
    return this;
  }

  withSubItem(title: string, href: string) {
    this.subItems.push({ title, href });
    return this;
  }

  withAction(
    onClick: () => void,
    iconOverride?: React.ReactNode,
    titleOverride?: string,
    className?: string
  ) {
    this.strategy = new ButtonStrategy(onClick, iconOverride, titleOverride, className);
    return this;
  }

  build() {
    if (!this.strategy) throw new Error("NavItem must have a strategy (navigation or action).");
    return new NavItem(this.title, this.icon, this.strategy, this.tooltip, this.subItems.length > 0 ? this.subItems : undefined);
  }
}
