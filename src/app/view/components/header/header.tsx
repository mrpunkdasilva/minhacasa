"use client";

import { SidebarTrigger } from "@/app/view/components/ui/sidebar";
import { Separator } from "@/app/view/components/ui/separator";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/view/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 bg-black px-4">
      <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-white" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
      <div className="flex-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
          MinhaCasa
        </h2>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 gap-2"
        >
          <Link href="/view/pages/invite">
            <UserPlus size={18} />
            <span className="hidden sm:inline">Convidar</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
