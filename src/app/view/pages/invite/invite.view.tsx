"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Users, UserPlus, Home } from "lucide-react";
import { Button } from "@/app/view/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/view/components/ui/card";
import {
  getCurrentHouse,
  getInviteLink,
  getHouseMembers,
  HouseMember,
} from "@/app/infra/actions/house.actions";
import { HouseEntity } from "@/app/domain/entity/house/house.entity";
import { QRCode } from "@/app/view/components/ui/qrcode";

export default function InviteView() {
  const [house, setHouse] = useState<HouseEntity | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [members, setMembers] = useState<HouseMember[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const copyToClipboard = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  useEffect(() => {
    async function loadData() {
      console.log("INVITE_VIEW: Starting to load data");
      try {
        const houseData = await getCurrentHouse();
        console.log("INVITE_VIEW: houseData received:", houseData?.name || "null");
        setHouse(houseData);

        if (houseData) {
          console.log("INVITE_VIEW: House found, fetching link and members");
          // Load non-critical data in parallel
          const [linkData, membersData] = await Promise.allSettled([
            getInviteLink(),
            getHouseMembers(),
          ]);

          if (linkData.status === "fulfilled" && linkData.value) {
            console.log("INVITE_VIEW: inviteLink received:", linkData.value);
            setInviteLink(linkData.value);
          } else {
            console.warn("INVITE_VIEW: Link fetch failed or empty, trying manual fetch");
            const manualLink = await getInviteLink();
            if (manualLink) setInviteLink(manualLink);
          }
          if (membersData.status === "fulfilled") {
            console.log("INVITE_VIEW: membersData received:", membersData.value.length);
            setMembers(membersData.value);
          }
        } else {
          console.warn("INVITE_VIEW: houseData is null, showing error state");
        }
      } catch (error) {
        console.error("INVITE_VIEW: Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <p className="text-zinc-500 animate-pulse text-sm">
          Organizando as chaves da casa...
        </p>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
        <div className="size-16 rounded-full bg-rose-500/10 flex items-center justify-center">
          <Home size={32} className="text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-white">
          Ops! Casa não encontrada
        </h2>
        <p className="text-zinc-500 max-w-md">
          Não conseguimos encontrar as informações da sua casa. Verifique se
          você está logado corretamente, meu bem.
        </p>
        <Button
          className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
          onClick={() => window.location.reload()}
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <UserPlus className="text-emerald-500" /> Convidar Moradores
        </h1>
        <p className="text-zinc-500">
          Traga mais pessoas para ajudar a organizar a {house.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card do Link de Convite */}
        <Card className="border-emerald-500/20 bg-zinc-900/50 backdrop-blur-sm text-white h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-500">
              <Home size={20} /> Seu Link Único
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Compartilhe este link ou deixe que escaneiem seu QR Code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            {inviteLink && (
              <div className="relative group transition-all duration-300 hover:scale-105">
                <div className="absolute -inset-0.5 bg-emerald-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <QRCode
                  value={inviteLink}
                  size={160}
                  className="relative bg-black p-4 rounded-xl shadow-2xl"
                />
              </div>
            )}
            
            <div className="w-full space-y-4">
              <div className="p-4 bg-black border border-zinc-800 rounded-lg flex items-center justify-between gap-4 overflow-hidden">
                <code className="text-xs text-zinc-400 truncate flex-1">
                  {inviteLink || "Carregando seu link..."}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="shrink-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
              <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest font-mono">
                Código da Casa: {house.inviteCode}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
              onClick={copyToClipboard}
            >
              {copied ? "Link Copiado!" : "Copiar Link"}
            </Button>
          </CardFooter>
        </Card>

        {/* Lista de Moradores Atuais */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-300">
              <Users size={20} /> Moradores Atuais
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Estas pessoas já têm as chaves da {house.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.uuid}
                  className="flex items-center gap-3 p-3 bg-black/40 border border-zinc-800/50 rounded-lg"
                >
                  <div className="size-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="text-emerald-500 font-bold uppercase">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {member.name}
                    </span>
                    <span className="text-xs text-zinc-500 truncate">
                      {member.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
