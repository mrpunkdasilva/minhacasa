"use client";

import { useEffect, useState } from "react";
import { Copy, Home, Check, Users, User } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuBadge,
} from "@/app/view/components/ui/sidebar";
import {
  getCurrentHouse,
  getInviteLink,
  getHouseMembers,
  HouseMember,
} from "@/app/infra/actions/house.actions";
import { HouseEntity } from "@/app/domain/entity/house/house.entity";

export function NavHouse() {
  const [house, setHouse] = useState<HouseEntity | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [members, setMembers] = useState<HouseMember[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCurrentHouse().then(setHouse);
    getInviteLink().then(setInviteLink);
    getHouseMembers().then(setMembers);
  }, []);

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!house) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Seu Lar</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2 text-emerald-500 bg-emerald-500/5 rounded-md mb-1 border border-emerald-500/10">
              <Home size={18} />
              <span className="font-bold truncate">Nossa Casa</span>
            </div>
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

      <SidebarGroupLabel className="mt-4 flex items-center gap-2">
        <Users size={14} /> Moradores
      </SidebarGroupLabel>
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
    </SidebarGroup>
  );
}
