"use client";

import { useEffect, useState } from "react";
import { Copy, Home, Check, Users, User, ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/app/view/components/ui/sidebar";
import {
  getCurrentHouse,
  getInviteLink,
  getHouseMembers,
  HouseMember,
} from "@/app/infra/actions/house.actions";
import { HouseEntity } from "@/app/domain/entity/house/house.entity";
import { cn } from "@/app/infra/lib/utils";

export function NavHouse() {
  const [house, setHouse] = useState<HouseEntity | null>(null);
  const [members, setMembers] = useState<HouseMember[]>([]);
  const [isMembersOpen, setIsMembersOpen] = useState(false);

  useEffect(() => {
    getCurrentHouse().then(setHouse);
    getHouseMembers().then(setMembers);
  }, []);

  if (!house) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Seu Lar</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2 text-emerald-500 bg-emerald-500/5 rounded-md mb-1 border border-emerald-500/10">
              <Home size={18} />
              <span className="font-bold truncate">Casa</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>

      <Collapsible.Root
        open={isMembersOpen}
        onOpenChange={setIsMembersOpen}
        className="group/collapsible"
      >
        <SidebarGroupLabel asChild className="mt-4">
          <Collapsible.Trigger className="flex w-full items-center gap-2 hover:text-emerald-500 transition-colors">
            <Users size={14} />
            <span>Moradores</span>
            <ChevronDown
              size={14}
              className={cn(
                "ml-auto transition-transform duration-200",
                !isMembersOpen && "-rotate-90",
              )}
            />
          </Collapsible.Trigger>
        </SidebarGroupLabel>
        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarGroupContent>
            <SidebarMenu>
              {members.map((member) => (
                <SidebarMenuItem key={member.uuid}>
                  <SidebarMenuButton className="h-8 py-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="size-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                        <User size={12} className="text-zinc-400" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate leading-tight">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate leading-tight">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </Collapsible.Content>
      </Collapsible.Root>
    </SidebarGroup>
  );
}
