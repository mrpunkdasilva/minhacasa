import { LucideIcon } from "lucide-react";
import React from "react";

export interface NavActionStrategy {
  render(item: NavItem, pathname: string): React.ReactNode;
}

export class NavItem {
  constructor(
    public title: string,
    public icon: LucideIcon,
    public strategy: NavActionStrategy,
    public tooltip?: string
  ) {}

  render(pathname: string): React.ReactNode {
    return this.strategy.render(this, pathname);
  }
}
