"use client";

import { LogOut, User } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/view/components/ui/sidebar";
import { signOut } from "@/app/infra/actions/auth.actions";
import { Session } from "next-auth";

export function NavUser({ session }: { session: Session | null }) {
  if (!session?.user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-3 px-3 py-2 border-b border-zinc-800 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <User size={18} />
          </div>
          <div className="flex flex-col overflow-hidden text-left text-sm">
            <span className="truncate font-semibold text-white">
              {session.user.name}
            </span>
            <span className="truncate text-xs text-zinc-500">
              {session.user.email}
            </span>
          </div>
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => signOut()}
          className="text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="size-4" />
          <span>Sair da Casa</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
